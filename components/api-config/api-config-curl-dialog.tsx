import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ApiConfig } from '@/lib/types';

interface ApiConfigCurlDialogProps {
  config: ApiConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiConfigCurlDialog({ config, open, onOpenChange }: ApiConfigCurlDialogProps) {
  const [copied, setCopied] = useState(false);

  const curlCommand = useMemo(() => {
    const method = (config.httpMethod || 'GET').toUpperCase();

    // Keep API path placeholders as-is so users can replace them
    let url = config.apiPath.startsWith('http')
      ? config.apiPath
      : `https://{HOST}${config.apiPath.startsWith('/') ? '' : '/'}${config.apiPath}`;

    const headers = [
      "-H 'Authorization: Bearer <ACCESS_TOKEN>'",
      ...(method !== 'GET' ? ["-H 'Content-Type: application/json'"] : []),
    ];

    // Build a minimal example body for non-GET methods from SQL params
    let dataPart = '';
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const sqlParams = config.sqlQuery.match(/:\w+/g) || [];
      const uniqueParams = Array.from(new Set(sqlParams.map((p) => p.slice(1))));
      const exampleBody: Record<string, string> = {};
      uniqueParams.forEach((p) => {
        exampleBody[p] = `<${p}>`;
      });
      const bodyString = JSON.stringify(exampleBody || {}, null, 2);
      dataPart = `--data '${bodyString}'`;
    }

    const methodPart = `-X ${method}`;
    const headerPart = headers.join(' ');

    const parts = [
      'curl',
      methodPart,
      `'${url}'`,
      headerPart,
      dataPart,
    ].filter(Boolean);

    return parts.join(' ');
  }, [config]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(curlCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // no-op
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">cURL Example</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Replace placeholders like {'<HOST>'}, {'<ACCESS_TOKEN>'} and {'<param>'} before executing.
          </p>

          <ScrollArea className="max-h-[50vh]">
            <div className="p-4 bg-gray-50 border rounded-lg">
              <pre className="text-sm font-mono whitespace-pre-wrap break-all">{curlCommand}</pre>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


