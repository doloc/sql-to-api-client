import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiConfig } from '@/lib/types';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ApiConfigTestDialogProps {
  config: ApiConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiConfigTestDialog({ config, open, onOpenChange }: ApiConfigTestDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State for different parameter types
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [bodyParams, setBodyParams] = useState<Record<string, string>>({});

  // Extract parameters from SQL query
  const extractParams = (sqlQuery: string) => {
    const params = new Set<string>();
    // Extract parameters from both SQL query and API path
    const sqlParams = sqlQuery.match(/:\w+/g) || [];
    const pathParams = config.apiPath.match(/\{(\w+)\}/g) || [];
    
    sqlParams.forEach(param => params.add(param.slice(1))); // Remove : prefix
    pathParams.forEach(param => params.add(param.slice(1, -1))); // Remove { and }
    
    return Array.from(params);
  };

  const handleTest = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResponse(null);

      // Construct URL with path parameters
      let url = config.apiPath;
      Object.entries(pathParams).forEach(([key, value]) => {
        if (value.trim()) {
          url = url.replace(`{${key}}`, value);
        }
      });

      // Add query parameters
      const queryParamsList = Object.entries(queryParams)
        .filter(([_, value]) => value.trim() !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`);
      
      if (queryParamsList.length > 0) {
        url += `?${queryParamsList.join('&')}`;
      }

      // Prepare request config
      const requestConfig: any = {
        method: config.httpMethod,
        url,
      };

      // Add body for POST, PUT, PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(config.httpMethod)) {
        const body = Object.entries(bodyParams).reduce((acc, [key, value]) => {
          if (value.trim() !== '') {
            try {
              // Try to parse as JSON if it looks like JSON
              if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
                acc[key] = JSON.parse(value);
              } else {
                acc[key] = value;
              }
            } catch {
              acc[key] = value;
            }
          }
          return acc;
        }, {} as Record<string, any>);

        if (Object.keys(body).length > 0) {
          requestConfig.data = body;
        }
      }

      console.log('Request config:', requestConfig); // Debug log
      const response = await api.request(requestConfig);
      setResponse(response.data);
    } catch (err: any) {
      console.error('Request error:', err); // Debug log
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const params = extractParams(config.sqlQuery);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">Test API Configuration</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
          {/* Request Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Badge variant={config.httpMethod === 'GET' ? 'default' : 
                          config.httpMethod === 'POST' ? 'secondary' :
                          config.httpMethod === 'PUT' ? 'outline' :
                          config.httpMethod === 'DELETE' ? 'destructive' : 'secondary'}>
              {config.httpMethod}
            </Badge>
            <span className="font-mono text-sm">{config.apiPath}</span>
          </div>

          {/* Parameters */}
          <div className="flex-1 min-h-0">
            <Tabs defaultValue="path" className="h-full flex flex-col">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="path">Path Parameters</TabsTrigger>
                <TabsTrigger value="query">Query Parameters</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <TabsContent value="path" className="space-y-4 p-4">
                  {params.length === 0 ? (
                    <p className="text-sm text-gray-500">No path parameters found in the SQL query.</p>
                  ) : (
                    params.map((param) => (
                      <div key={param} className="flex items-center gap-2">
                        <span className="w-32 font-medium">{param}:</span>
                        <Input
                          value={pathParams[param] || ''}
                          onChange={(e) => setPathParams({ ...pathParams, [param]: e.target.value })}
                          placeholder={`Enter ${param}`}
                          className="flex-1"
                        />
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="query" className="space-y-4 p-4">
                  {params.length === 0 ? (
                    <p className="text-sm text-gray-500">No query parameters found in the SQL query.</p>
                  ) : (
                    params.map((param) => (
                      <div key={param} className="flex items-center gap-2">
                        <span className="w-32 font-medium">{param}:</span>
                        <Input
                          value={queryParams[param] || ''}
                          onChange={(e) => setQueryParams({ ...queryParams, [param]: e.target.value })}
                          placeholder={`Enter ${param}`}
                          className="flex-1"
                        />
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="body" className="space-y-4 p-4">
                  {params.length === 0 ? (
                    <p className="text-sm text-gray-500">No body parameters found in the SQL query.</p>
                  ) : (
                    params.map((param) => (
                      <div key={param} className="flex items-center gap-2">
                        <span className="w-32 font-medium">{param}:</span>
                        <Input
                          value={bodyParams[param] || ''}
                          onChange={(e) => setBodyParams({ ...bodyParams, [param]: e.target.value })}
                          placeholder={`Enter ${param}`}
                          className="flex-1"
                        />
                      </div>
                    ))
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleTest} 
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>

          {/* Response/Error */}
          <div className="flex-1 min-h-0">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-red-800 font-medium mb-2">Error</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {response && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700">Response</h3>
                <ScrollArea className="h-[200px]">
                  <div className="p-4 bg-gray-50 border rounded-lg">
                    <pre className="text-sm font-mono whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}