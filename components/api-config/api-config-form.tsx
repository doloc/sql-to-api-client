import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ApiConfig } from '@/lib/types';

const formSchema = z.object({
  apiPath: z.string().min(1, 'API path is required'),
  httpMethod: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  sqlQuery: z.string().min(1, 'SQL query is required'),
  dbSource: z.string().min(1, 'Database source is required'),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface ApiConfigFormProps {
  initialData?: ApiConfig;
  onSubmit: (data: Omit<ApiConfig, 'id' | 'createdTimestamp' | 'lastUpdateTimestamp'>) => Promise<void>;
  onClose: () => void;
}

export function ApiConfigForm({ initialData, onSubmit, onClose }: ApiConfigFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiPath: initialData?.apiPath || '',
      httpMethod: (initialData?.httpMethod as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH') || 'GET',
      sqlQuery: initialData?.sqlQuery || '',
      dbSource: initialData?.dbSource || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      await onSubmit(values);
      form.reset();
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="apiPath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Path</FormLabel>
              <FormControl>
                <Input placeholder="/api/example" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="httpMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HTTP Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sqlQuery"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SQL Query</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="SELECT * FROM table WHERE id = :id"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dbSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Database Source</FormLabel>
              <FormControl>
                <Input placeholder="main_db" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </form>
    </Form>
  );
} 