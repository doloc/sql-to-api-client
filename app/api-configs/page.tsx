'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiConfigForm } from '@/components/api-config/api-config-form';
import { ApiConfigList } from '@/components/api-config/api-config-list';
import { ApiConfig, CreateApiConfigParams } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getApiConfigs, createApiConfig, updateApiConfig, deleteApiConfig } from '@/lib/api';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from '@/components/loading-spinner';
import { useAuthStore } from '@/lib/auth';

export default function ApiConfigsPage() {
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ApiConfig | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const toast = useToast();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const expiry = useAuthStore((s) => s.expiry);
  const logout = useAuthStore((s) => s.logout);

  // Pre-hydration quick check: look at localStorage and redirect early if unauthenticated/expired
  useEffect(() => {
    if (isHydrated) return;
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
      if (!stored) {
        router.replace('/login');
        return;
      }
      const parsed = JSON.parse(stored);
      const state = parsed?.state ?? {};
      const token = state.token as string | null;
      const exp = state.expiry as number | null;
      const isExpired = typeof exp === 'number' && exp <= Date.now();
      if (!token || isExpired) {
        router.replace('/login');
      }
    } catch {}
  }, [isHydrated, router]);

  // Client-side route guard
  useEffect(() => {
    if (!isHydrated) return;
    const isExpired = typeof expiry === 'number' && expiry <= Date.now();
    if (!isAuthenticated || isExpired) {
      if (isExpired) logout();
      router.replace('/login');
    }
  }, [isAuthenticated, isHydrated, expiry, logout, router]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    if (typeof expiry === 'number' && expiry <= Date.now()) return;
    loadConfigs();
  }, [currentPage, isHydrated, isAuthenticated, expiry]);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      const response = await getApiConfigs({ page: currentPage, pageSize });
      if (response?.data?.content) {
        setConfigs(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        setConfigs([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to load API configurations:', error);
      toast.error('Failed to load API configurations');
      setConfigs([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Omit<ApiConfig, 'id' | 'createdTimestamp' | 'lastUpdateTimestamp'>) => {
    try {
      if (editingConfig) {
        await updateApiConfig({ id: editingConfig.id, ...data });
        toast.success('API configuration updated successfully');
      } else {
        const createData: CreateApiConfigParams = {
          apiPath: data.apiPath,
          httpMethod: data.httpMethod,
          sqlQuery: data.sqlQuery,
          dbSource: data.dbSource,
          isActive: data.isActive,
        };
        await createApiConfig(createData);
        toast.success('API configuration created successfully');
      }
      await loadConfigs();
      setIsDialogOpen(false);
      setEditingConfig(undefined);
    } catch (error) {
      console.error('Failed to save API configuration:', error);
      toast.error('Failed to save API configuration');
    }
  };

  const handleEdit = async (config: ApiConfig) => {
    setEditingConfig(config);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this API configuration?')) {
      try {
        await deleteApiConfig(id);
        toast.success('API configuration deleted successfully');
        await loadConfigs();
      } catch (error) {
        console.error('Failed to delete API configuration:', error);
        toast.error('Failed to delete API configuration');
      }
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await updateApiConfig({ id, isActive });
      toast.success(`API configuration ${isActive ? 'activated' : 'deactivated'} successfully`);
      await loadConfigs();
    } catch (error) {
      console.error('Failed to toggle API configuration status:', error);
      toast.error('Failed to update API configuration status');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenDialog = () => {
    setEditingConfig(undefined);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-10">
      {(!isHydrated || !isAuthenticated) && (
        <div className="flex w-full justify-center py-20">
          <LoadingSpinner />
        </div>
      )}
      {(!isHydrated || !isAuthenticated) ? null : (
      <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">API Configurations</h1>
        <Button onClick={handleOpenDialog}>Add New Configuration</Button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <ApiConfigList
            configs={configs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
          
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? 'Edit API Configuration' : 'Add API Configuration'}
            </DialogTitle>
          </DialogHeader>
          <ApiConfigForm
            initialData={editingConfig}
            onSubmit={handleSubmit}
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      </>
      )}
    </div>
  );
} 