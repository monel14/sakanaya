/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useRef } from 'react';

const ChartComponent = ({ type, data, options }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if(!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    chartInstance.current = new (window as any).Chart(ctx, { type, data, options });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options]);

  return <canvas ref={chartRef}></canvas>;
};

export default ChartComponent;
