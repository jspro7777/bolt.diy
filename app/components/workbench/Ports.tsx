import { memo, useState, useEffect } from 'react';
import { IconButton } from '~/components/ui/IconButton';
import { PanelHeaderButton } from '~/components/ui/PanelHeaderButton';
import { classNames } from '~/utils/classNames';

interface PortInfo {
  port: number;
  protocol: string;
  service: string;
  status: 'open' | 'closed' | 'filtered';
  description?: string;
}

interface ServiceInfo {
  name: string;
  port: number;
  status: 'running' | 'stopped' | 'error';
  pid?: number;
  memory?: string;
  cpu?: string;
}

export const Ports = memo(() => {
  const [ports, setPorts] = useState<PortInfo[]>([
    { port: 80, protocol: 'TCP', service: 'HTTP', status: 'open', description: 'Web server' },
    { port: 443, protocol: 'TCP', service: 'HTTPS', status: 'open', description: 'Secure web server' },
    { port: 22, protocol: 'TCP', service: 'SSH', status: 'open', description: 'Secure shell' },
    { port: 3000, protocol: 'TCP', service: 'Node.js', status: 'open', description: 'Development server' },
    { port: 5173, protocol: 'TCP', service: 'Vite', status: 'open', description: 'Vite dev server' },
    { port: 8080, protocol: 'TCP', service: 'HTTP-Alt', status: 'closed', description: 'Alternative HTTP port' },
    { port: 3306, protocol: 'TCP', service: 'MySQL', status: 'filtered', description: 'Database server' },
  ]);

  const [services, setServices] = useState<ServiceInfo[]>([
    { name: 'nginx', port: 80, status: 'running', pid: 1234, memory: '15.2 MB', cpu: '2.1%' },
    { name: 'node', port: 3000, status: 'running', pid: 5678, memory: '45.8 MB', cpu: '5.3%' },
    { name: 'vite', port: 5173, status: 'running', pid: 9012, memory: '23.1 MB', cpu: '1.8%' },
    { name: 'mysql', port: 3306, status: 'stopped', pid: undefined, memory: undefined, cpu: undefined },
  ]);

  const [scanning, setScanning] = useState(false);
  const [selectedPort, setSelectedPort] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'filtered'>('all');

  const filteredPorts = ports.filter(port => filter === 'all' || port.status === filter);

  const startPortScan = () => {
    setScanning(true);
    // Simulate port scanning
    setTimeout(() => {
      setScanning(false);
      // Add some random discovered ports
      const newPorts = [
        { port: Math.floor(Math.random() * 1000) + 8000, protocol: 'TCP', service: 'Unknown', status: 'open' as const, description: 'Discovered service' },
        { port: Math.floor(Math.random() * 1000) + 9000, protocol: 'UDP', service: 'Unknown', status: 'filtered' as const, description: 'Filtered port' },
      ];
      setPorts(prev => [...prev, ...newPorts]);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-green-500';
      case 'closed':
        return 'text-red-500';
      case 'filtered':
        return 'text-yellow-500';
      case 'running':
        return 'text-green-500';
      case 'stopped':
        return 'text-red-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
      case 'running':
        return 'i-ph:check-circle';
      case 'closed':
      case 'stopped':
        return 'i-ph:x-circle';
      case 'filtered':
        return 'i-ph:question-circle';
      case 'error':
        return 'i-ph:warning-circle';
      default:
        return 'i-ph:circle';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-bolt-elements-borderColor">
        <h2 className="text-lg font-semibold text-bolt-elements-textPrimary">Ports & Services</h2>
        <div className="flex gap-2">
          <PanelHeaderButton
            onClick={startPortScan}
            disabled={scanning}
            className="text-sm"
          >
            {scanning ? <div className="i-ph:spinner animate-spin" /> : <div className="i-ph:radar" />}
            {scanning ? 'Scanning...' : 'Scan Ports'}
          </PanelHeaderButton>
          <PanelHeaderButton
            onClick={() => setFilter('all')}
            className={classNames('text-sm', { 'bg-bolt-elements-accent': filter === 'all' })}
          >
            All
          </PanelHeaderButton>
          <PanelHeaderButton
            onClick={() => setFilter('open')}
            className={classNames('text-sm', { 'bg-bolt-elements-accent': filter === 'open' })}
          >
            Open
          </PanelHeaderButton>
          <PanelHeaderButton
            onClick={() => setFilter('closed')}
            className={classNames('text-sm', { 'bg-bolt-elements-accent': filter === 'closed' })}
          >
            Closed
          </PanelHeaderButton>
          <PanelHeaderButton
            onClick={() => setFilter('filtered')}
            className={classNames('text-sm', { 'bg-bolt-elements-accent': filter === 'filtered' })}
          >
            Filtered
          </PanelHeaderButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 h-full">
          {/* Ports Section */}
          <div className="bg-bolt-elements-background-depth-3 rounded-lg p-4 overflow-hidden">
            <h3 className="text-md font-medium text-bolt-elements-textPrimary mb-3">Network Ports</h3>
            <div className="overflow-y-auto h-full">
              <div className="space-y-2">
                {filteredPorts.map((port) => (
                  <div
                    key={port.port}
                    className={classNames(
                      'p-3 rounded-lg border cursor-pointer transition-colors',
                      {
                        'border-bolt-elements-accent bg-bolt-elements-accent/10': selectedPort === port.port,
                        'border-bolt-elements-borderColor hover:border-bolt-elements-accent/50': selectedPort !== port.port,
                      }
                    )}
                    onClick={() => setSelectedPort(port.port)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={classNames('text-lg', getStatusColor(port.status))}>
                          <div className={getStatusIcon(port.status)} />
                        </div>
                        <div>
                          <div className="font-mono text-sm font-medium text-bolt-elements-textPrimary">
                            {port.port}
                          </div>
                          <div className="text-xs text-bolt-elements-textSecondary">
                            {port.protocol} • {port.service}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-bolt-elements-textSecondary capitalize">
                        {port.status}
                      </div>
                    </div>
                    {port.description && (
                      <div className="mt-2 text-xs text-bolt-elements-textSecondary">
                        {port.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-bolt-elements-background-depth-3 rounded-lg p-4 overflow-hidden">
            <h3 className="text-md font-medium text-bolt-elements-textPrimary mb-3">Running Services</h3>
            <div className="overflow-y-auto h-full">
              <div className="space-y-2">
                {services.map((service) => (
                  <div
                    key={service.name}
                    className="p-3 rounded-lg border border-bolt-elements-borderColor hover:border-bolt-elements-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={classNames('text-lg', getStatusColor(service.status))}>
                          <div className={getStatusIcon(service.status)} />
                        </div>
                        <div>
                          <div className="font-medium text-bolt-elements-textPrimary">
                            {service.name}
                          </div>
                          <div className="text-xs text-bolt-elements-textSecondary">
                            Port {service.port}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-bolt-elements-textSecondary capitalize">
                          {service.status}
                        </div>
                        {service.pid && (
                          <div className="text-xs text-bolt-elements-textSecondary">
                            PID: {service.pid}
                          </div>
                        )}
                      </div>
                    </div>
                    {(service.memory || service.cpu) && (
                      <div className="mt-2 flex gap-4 text-xs text-bolt-elements-textSecondary">
                        {service.memory && <span>Memory: {service.memory}</span>}
                        {service.cpu && <span>CPU: {service.cpu}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Port Details */}
        {selectedPort && (
          <div className="border-t border-bolt-elements-borderColor p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-bolt-elements-textPrimary">
                Port {selectedPort} Details
              </h4>
              <IconButton
                icon="i-ph:x"
                size="sm"
                onClick={() => setSelectedPort(null)}
              />
            </div>
            <div className="bg-bolt-elements-background-depth-3 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-bolt-elements-textSecondary mb-1">Port Number</div>
                  <div className="font-mono text-bolt-elements-textPrimary">{selectedPort}</div>
                </div>
                <div>
                  <div className="text-bolt-elements-textSecondary mb-1">Protocol</div>
                  <div className="text-bolt-elements-textPrimary">TCP</div>
                </div>
                <div>
                  <div className="text-bolt-elements-textSecondary mb-1">Service</div>
                  <div className="text-bolt-elements-textPrimary">
                    {ports.find(p => p.port === selectedPort)?.service || 'Unknown'}
                  </div>
                </div>
                <div>
                  <div className="text-bolt-elements-textSecondary mb-1">Status</div>
                  <div className="text-bolt-elements-textPrimary">
                    {ports.find(p => p.port === selectedPort)?.status || 'Unknown'}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-bolt-elements-textSecondary mb-1">Description</div>
                <div className="text-bolt-elements-textPrimary">
                  {ports.find(p => p.port === selectedPort)?.description || 'No description available'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});