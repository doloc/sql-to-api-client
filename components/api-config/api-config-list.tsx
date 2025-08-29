import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiConfig } from '@/lib/types';
import { ApiConfigTestDialog } from './api-config-test-dialog';
import { ApiConfigCurlDialog } from './api-config-curl-dialog';

interface ApiConfigListProps {
  configs: ApiConfig[];
  onEdit: (config: ApiConfig) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggleActive: (id: number, isActive: boolean) => Promise<void>;
}

export function ApiConfigList({
  configs,
  onEdit,
  onDelete,
  onToggleActive,
}: ApiConfigListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dbSourceFilter, setDbSourceFilter] = useState<string>('all');
  const [testingConfig, setTestingConfig] = useState<ApiConfig | undefined>();
  const [curlConfig, setCurlConfig] = useState<ApiConfig | undefined>();

  const filteredConfigs = configs.filter((config) => {
    const matchesSearch = config.apiPath
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesMethod =
      methodFilter === 'all' || config.httpMethod === methodFilter;
    const matchesDbSource =
      dbSourceFilter === 'all' || config.dbSource === dbSourceFilter;

    return matchesSearch && matchesMethod && matchesDbSource;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search by API path..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dbSourceFilter} onValueChange={setDbSourceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by DB source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All DB Sources</SelectItem>
            {Array.from(new Set(configs.map((c) => c.dbSource))).map((source) => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>API Path</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>DB Source</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConfigs.map((config) => (
              <TableRow key={config.id}>
                <TableCell>{config.apiPath}</TableCell>
                <TableCell>{config.httpMethod}</TableCell>
                <TableCell>{config.dbSource}</TableCell>
                <TableCell>
                  <Switch
                    checked={config.isActive}
                    onCheckedChange={(checked) =>
                      onToggleActive(config.id, checked)
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(config)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => onDelete(config.id)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600"
                    onClick={() => setTestingConfig(config)}
                  >
                    Test
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600"
                    onClick={() => setCurlConfig(config)}
                  >
                    cURL
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {testingConfig && (
        <ApiConfigTestDialog
          config={testingConfig}
          open={!!testingConfig}
          onOpenChange={(open) => !open && setTestingConfig(undefined)}
        />
      )}

      {curlConfig && (
        <ApiConfigCurlDialog
          config={curlConfig}
          open={!!curlConfig}
          onOpenChange={(open) => !open && setCurlConfig(undefined)}
        />
      )}
    </div>
  );
} 