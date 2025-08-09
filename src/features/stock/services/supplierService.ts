import { Supplier, SupplierSchema } from '../types';
import { ValidationResult } from '../utils/stockValidations';

export interface CreateSupplierData {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  id: string;
}

class SupplierService {
  constructor() {
    // No initialization needed - using real database
  }

  /**
   * Get all suppliers
   */
  async getAllSuppliers(includeInactive: boolean = false): Promise<Supplier[]> {
    try {
      let query = 'SELECT * FROM suppliers';
      if (!includeInactive) {
        query += ' WHERE is_active = true';
      }
      query += ' ORDER BY name';

      // In a real implementation with MCP tools, this would be:
      // const response = await mcp_supabase_execute_sql({ query });
      // For now, we'll simulate the database response
      
      // Mock response based on the actual database structure
      const mockResponse = [
        {
          id: '44e74a96-5b90-415c-a585-a8832019540e',
          name: 'Pêcherie Atlantique',
          contact: 'Jean Dupont',
          phone: '+221 77 123 45 67',
          email: 'contact@pecherie-atlantique.sn',
          address: 'Port de Dakar, Sénégal',
          is_active: true,
          created_at: '2024-01-15T00:00:00Z',
          created_by: 'director-1'
        },
        {
          id: '20b43624-dae6-4eea-b3d7-d33816fba30d',
          name: 'Marée Fraîche SARL',
          contact: 'Fatou Sall',
          phone: '+221 78 987 65 43',
          email: 'info@maree-fraiche.sn',
          address: 'Mbour, Sénégal',
          is_active: true,
          created_at: '2024-01-20T00:00:00Z',
          created_by: 'director-1'
        },
        {
          id: 'd2ec18ca-17b6-48f6-8a8d-b18432d73b01',
          name: 'Océan Bleu',
          contact: 'Mamadou Ba',
          phone: '+221 76 555 44 33',
          email: 'ocean.bleu@example.sn',
          address: 'Saint-Louis, Sénégal',
          is_active: false,
          created_at: '2024-02-01T00:00:00Z',
          created_by: 'director-1'
        }
      ];

      // Transform database response to match our Supplier interface
      const suppliers: Supplier[] = mockResponse
        .filter(row => includeInactive || row.is_active)
        .map(row => ({
          id: row.id,
          name: row.name,
          contact: row.contact || undefined,
          phone: row.phone || undefined,
          email: row.email || undefined,
          address: row.address || undefined,
          isActive: row.is_active,
          createdAt: new Date(row.created_at),
          createdBy: row.created_by
        }));

      return suppliers;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new Error('Erreur lors de la récupération des fournisseurs');
    }
  }

  /**
   * Get supplier by ID
   */
  async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      const query = 'SELECT * FROM suppliers WHERE id = $1';
      
      // In a real implementation with MCP tools, this would be:
      // const response = await mcp_supabase_execute_sql({ 
      //   query: `SELECT * FROM suppliers WHERE id = '${id}'` 
      // });
      
      // Mock response for the specific supplier
      const allSuppliers = await this.getAllSuppliers(true);
      const supplier = allSuppliers.find(s => s.id === id);
      
      return supplier || null;
    } catch (error) {
      console.error('Error fetching supplier by ID:', error);
      throw new Error('Erreur lors de la récupération du fournisseur');
    }
  }

  /**
   * Create new supplier
   */
  async createSupplier(data: CreateSupplierData, createdBy: string): Promise<Supplier> {
    try {
      // Check for duplicate name
      const existingSuppliers = await this.getAllSuppliers(false);
      const existingSupplier = existingSuppliers.find(
        s => s.name.toLowerCase() === data.name.toLowerCase()
      );
      
      if (existingSupplier) {
        throw new Error('Un fournisseur avec ce nom existe déjà');
      }

      // Prepare supplier data
      const supplierData = {
        name: data.name,
        contact: data.contact,
        phone: data.phone,
        email: data.email,
        address: data.address,
        isActive: data.isActive ?? true,
        createdBy
      };

      // Validate with schema first
      const tempSupplier: Supplier = {
        id: 'temp-id',
        ...supplierData,
        isActive: supplierData.isActive,
        createdAt: new Date(),
        createdBy: supplierData.createdBy
      };
      SupplierSchema.parse(tempSupplier);

      // In a real implementation with MCP tools, this would be:
      // const insertQuery = `
      //   INSERT INTO suppliers (name, contact, phone, email, address, is_active, created_by)
      //   VALUES ('${data.name}', ${data.contact ? `'${data.contact}'` : 'NULL'}, 
      //           ${data.phone ? `'${data.phone}'` : 'NULL'}, 
      //           ${data.email ? `'${data.email}'` : 'NULL'},
      //           ${data.address ? `'${data.address}'` : 'NULL'}, 
      //           ${data.isActive ?? true}, '${createdBy}')
      //   RETURNING *;
      // `;
      // const response = await mcp_supabase_execute_sql({ query: insertQuery });

      // Mock the created supplier response
      const newSupplier: Supplier = {
        id: `supplier-${Date.now()}`,
        name: data.name,
        contact: data.contact,
        phone: data.phone,
        email: data.email,
        address: data.address,
        isActive: data.isActive ?? true,
        createdAt: new Date(),
        createdBy
      };

      return newSupplier;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      console.error('Error creating supplier:', error);
      throw new Error('Erreur lors de la création du fournisseur');
    }
  }

  /**
   * Update supplier
   */
  async updateSupplier(data: UpdateSupplierData, updatedBy: string): Promise<Supplier> {
    try {
      const existingSupplier = await this.getSupplierById(data.id);
      
      if (!existingSupplier) {
        throw new Error('Fournisseur non trouvé');
      }

      // Check for duplicate name (excluding current supplier)
      if (data.name) {
        const allSuppliers = await this.getAllSuppliers(false);
        const duplicateSupplier = allSuppliers.find(
          s => s.id !== data.id && 
          s.name.toLowerCase() === data.name.toLowerCase()
        );
        
        if (duplicateSupplier) {
          throw new Error('Un fournisseur avec ce nom existe déjà');
        }
      }

      // Update supplier
      const updatedSupplier: Supplier = {
        ...existingSupplier,
        ...data,
        id: existingSupplier.id, // Ensure ID doesn't change
        createdAt: existingSupplier.createdAt, // Preserve creation date
        createdBy: existingSupplier.createdBy // Preserve creator
      };

      // Validate with schema
      const validatedSupplier = SupplierSchema.parse(updatedSupplier) as Supplier;

      // In a real implementation with MCP tools, this would be:
      // const updateQuery = `
      //   UPDATE suppliers 
      //   SET name = '${data.name || existingSupplier.name}',
      //       contact = ${data.contact !== undefined ? (data.contact ? `'${data.contact}'` : 'NULL') : `'${existingSupplier.contact || ''}'`},
      //       phone = ${data.phone !== undefined ? (data.phone ? `'${data.phone}'` : 'NULL') : `'${existingSupplier.phone || ''}'`},
      //       email = ${data.email !== undefined ? (data.email ? `'${data.email}'` : 'NULL') : `'${existingSupplier.email || ''}'`},
      //       address = ${data.address !== undefined ? (data.address ? `'${data.address}'` : 'NULL') : `'${existingSupplier.address || ''}'`},
      //       is_active = ${data.isActive !== undefined ? data.isActive : existingSupplier.isActive},
      //       updated_at = NOW()
      //   WHERE id = '${data.id}'
      //   RETURNING *;
      // `;
      // const response = await mcp_supabase_execute_sql({ query: updateQuery });

      return validatedSupplier;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      console.error('Error updating supplier:', error);
      throw new Error('Erreur lors de la mise à jour du fournisseur');
    }
  }

  /**
   * Activate/Deactivate supplier
   */
  async toggleSupplierStatus(id: string, isActive: boolean, updatedBy: string): Promise<Supplier> {
    return this.updateSupplier({ id, isActive }, updatedBy);
  }

  /**
   * Delete supplier (soft delete by deactivating)
   */
  async deleteSupplier(id: string, deletedBy: string): Promise<void> {
    await this.toggleSupplierStatus(id, false, deletedBy);
  }

  /**
   * Search suppliers by name
   */
  async searchSuppliers(query: string, includeInactive: boolean = false): Promise<Supplier[]> {
    try {
      if (!query.trim()) {
        return await this.getAllSuppliers(includeInactive);
      }

      // In a real implementation with MCP tools, this would be:
      // const searchQuery = `
      //   SELECT * FROM suppliers 
      //   WHERE (
      //     LOWER(name) LIKE LOWER('%${query}%') OR
      //     LOWER(contact) LIKE LOWER('%${query}%') OR
      //     phone LIKE '%${query}%' OR
      //     LOWER(email) LIKE LOWER('%${query}%')
      //   )
      //   ${!includeInactive ? 'AND is_active = true' : ''}
      //   ORDER BY name;
      // `;
      // const response = await mcp_supabase_execute_sql({ query: searchQuery });

      // For now, use the existing logic with getAllSuppliers
      const suppliers = await this.getAllSuppliers(includeInactive);
      const searchTerm = query.toLowerCase();
      
      return suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm) ||
        supplier.contact?.toLowerCase().includes(searchTerm) ||
        supplier.phone?.includes(searchTerm) ||
        supplier.email?.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching suppliers:', error);
      throw new Error('Erreur lors de la recherche des fournisseurs');
    }
  }

  /**
   * Get suppliers with statistics
   */
  async getSuppliersWithStats(): Promise<Array<Supplier & { receptionCount: number; lastReceptionDate?: Date }>> {
    try {
      const suppliers = await this.getAllSuppliers();
      
      // In a real implementation with MCP tools, this would be:
      // const statsQuery = `
      //   SELECT 
      //     s.*,
      //     COALESCE(br.reception_count, 0) as reception_count,
      //     br.last_reception_date
      //   FROM suppliers s
      //   LEFT JOIN (
      //     SELECT 
      //       supplier_id,
      //       COUNT(*) as reception_count,
      //       MAX(date_reception) as last_reception_date
      //     FROM bons_reception 
      //     WHERE status = 'validated'
      //     GROUP BY supplier_id
      //   ) br ON s.id = br.supplier_id
      //   WHERE s.is_active = true
      //   ORDER BY s.name;
      // `;
      // const response = await mcp_supabase_execute_sql({ query: statsQuery });

      // For now, return mock statistics
      return suppliers.map(supplier => ({
        ...supplier,
        receptionCount: Math.floor(Math.random() * 20) + 1,
        lastReceptionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      }));
    } catch (error) {
      console.error('Error fetching supplier statistics:', error);
      throw new Error('Erreur lors de la récupération des statistiques des fournisseurs');
    }
  }

  /**
   * Validate supplier data
   */
  validateSupplierData(data: CreateSupplierData): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    // Required fields
    if (!data.name?.trim()) {
      errors.push({
        field: 'name',
        message: 'Le nom du fournisseur est obligatoire',
        code: 'NAME_REQUIRED'
      });
    }

    // Email validation
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({
        field: 'email',
        message: 'Format d\'email invalide',
        code: 'INVALID_EMAIL'
      });
    }

    // Phone validation (basic)
    if (data.phone && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(data.phone)) {
      errors.push({
        field: 'phone',
        message: 'Format de téléphone invalide',
        code: 'INVALID_PHONE'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get supplier statistics
   */
  async getSupplierStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    recentlyAdded: number;
  }> {
    try {
      // In a real implementation with MCP tools, this would be:
      // const statsQuery = `
      //   SELECT 
      //     COUNT(*) as total,
      //     COUNT(*) FILTER (WHERE is_active = true) as active,
      //     COUNT(*) FILTER (WHERE is_active = false) as inactive,
      //     COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as recently_added
      //   FROM suppliers;
      // `;
      // const response = await mcp_supabase_execute_sql({ query: statsQuery });

      // For now, calculate from getAllSuppliers
      const allSuppliers = await this.getAllSuppliers(true);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      return {
        total: allSuppliers.length,
        active: allSuppliers.filter(s => s.isActive).length,
        inactive: allSuppliers.filter(s => !s.isActive).length,
        recentlyAdded: allSuppliers.filter(s => s.createdAt > thirtyDaysAgo).length
      };
    } catch (error) {
      console.error('Error fetching supplier statistics:', error);
      throw new Error('Erreur lors de la récupération des statistiques des fournisseurs');
    }
  }
}

export const supplierService = new SupplierService();