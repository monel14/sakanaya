import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useScreenSize } from './ResponsiveWrapper';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  itemHeight: number | ((index: number) => number);
  containerHeight?: number;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight = 400,
  overscan = 5,
  className = '',
  onScroll,
  loading = false,
  loadingComponent,
  emptyComponent,
  onEndReached,
  endReachedThreshold = 0.8
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRect, setContainerRect] = useState({ height: containerHeight, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useScreenSize();

  // Calculate item heights
  const getItemHeight = useCallback((index: number): number => {
    return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
  }, [itemHeight]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (typeof itemHeight === 'number') {
      return items.length * itemHeight;
    }
    
    let height = 0;
    for (let i = 0; i < items.length; i++) {
      height += getItemHeight(i);
    }
    return height;
  }, [items.length, getItemHeight]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (items.length === 0) return { start: 0, end: 0 };

    let start = 0;
    let end = 0;
    let accumulatedHeight = 0;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      if (accumulatedHeight + height > scrollTop) {
        start = Math.max(0, i - overscan);
        break;
      }
      accumulatedHeight += height;
    }

    // Find end index
    accumulatedHeight = 0;
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      accumulatedHeight += height;
      if (accumulatedHeight > scrollTop + containerRect.height) {
        end = Math.min(items.length - 1, i + overscan);
        break;
      }
    }

    if (end === 0) end = items.length - 1;

    return { start, end };
  }, [scrollTop, containerRect.height, items.length, overscan, getItemHeight]);

  // Calculate offset for visible items
  const getItemOffset = useCallback((index: number): number => {
    if (typeof itemHeight === 'number') {
      return index * itemHeight;
    }

    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getItemHeight(i);
    }
    return offset;
  }, [getItemHeight]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);

    // Check if we've reached the end
    if (onEndReached) {
      const { scrollHeight, clientHeight } = e.currentTarget;
      const scrollPercentage = (newScrollTop + clientHeight) / scrollHeight;
      
      if (scrollPercentage >= endReachedThreshold) {
        onEndReached();
      }
    }
  }, [onScroll, onEndReached, endReachedThreshold]);

  // Update container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerRect({ height: rect.height, width: rect.width });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Render visible items
  const visibleItems = useMemo(() => {
    const items_to_render = [];
    
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      if (i >= items.length) break;
      
      const item = items[i];
      const offset = getItemOffset(i);
      const height = getItemHeight(i);
      
      const style: React.CSSProperties = {
        position: 'absolute',
        top: offset,
        left: 0,
        right: 0,
        height: height,
        width: '100%'
      };

      items_to_render.push(
        <div key={i} style={style}>
          {renderItem(item, i, style)}
        </div>
      );
    }
    
    return items_to_render;
  }, [visibleRange, items, getItemOffset, getItemHeight, renderItem]);

  // Loading state
  if (loading && loadingComponent) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        {loadingComponent}
      </div>
    );
  }

  // Empty state
  if (items.length === 0 && emptyComponent) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        {emptyComponent}
      </div>
    );
  }

  // Mobile optimization: reduce virtualization on mobile for better touch scrolling
  if (isMobile && items.length < 100) {
    return (
      <div 
        ref={containerRef}
        className={`overflow-auto ${className}`}
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div className="space-y-1">
          {items.map((item, index) => (
            <div key={index}>
              {renderItem(item, index, {})}
            </div>
          ))}
        </div>
        {loading && loadingComponent && (
          <div className="flex justify-center py-4">
            {loadingComponent}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
        {loading && loadingComponent && (
          <div 
            className="flex justify-center py-4"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            {loadingComponent}
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for infinite scrolling with virtualization
export function useInfiniteVirtualizedList<T>(
  fetchData: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
  itemHeight: number | ((index: number) => number),
  initialPage: number = 0
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchData(page);
      
      setItems(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchData, page, loading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
  }, [initialPage]);

  // Load initial data
  useEffect(() => {
    if (items.length === 0 && !loading) {
      loadMore();
    }
  }, []);

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    reset
  };
}

// Optimized list item component
interface OptimizedListItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const OptimizedListItem = React.memo<OptimizedListItemProps>(({
  children,
  className = '',
  onClick,
  style
}) => {
  return (
    <div 
      className={`${className} ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
});

OptimizedListItem.displayName = 'OptimizedListItem';

// Performance monitoring for virtualized lists
export class VirtualizedListPerformanceMonitor {
  private static renderTimes: number[] = [];
  private static scrollEvents: number = 0;
  private static lastScrollTime: number = 0;

  static recordRenderTime(time: number) {
    this.renderTimes.push(time);
    if (this.renderTimes.length > 100) {
      this.renderTimes = this.renderTimes.slice(-50);
    }
  }

  static recordScrollEvent() {
    this.scrollEvents++;
    this.lastScrollTime = Date.now();
  }

  static getStats() {
    const avgRenderTime = this.renderTimes.length > 0 
      ? this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length
      : 0;

    return {
      averageRenderTime: avgRenderTime,
      totalScrollEvents: this.scrollEvents,
      lastScrollTime: this.lastScrollTime,
      renderSamples: this.renderTimes.length
    };
  }

  static reset() {
    this.renderTimes = [];
    this.scrollEvents = 0;
    this.lastScrollTime = 0;
  }
}