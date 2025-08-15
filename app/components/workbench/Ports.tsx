import { memo, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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

interface ForwardedPort {
  localPort: number;
  publicPort: number;
  protocol: string;
  visibility: 'private' | 'public';
  publicUrl: string;
  status: 'active' | 'inactive';
  createdAt: Date;
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
  const [forwardedPorts, setForwardedPorts] = useState<ForwardedPort[]>([
    {
      localPort: 3000,
      publicPort: 8080,
      protocol: 'TCP',
      visibility: 'public',
      publicUrl: 'https://abc123.ngrok.io',
      status: 'active',
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      localPort: 5173,
      publicPort: 9000,
      protocol: 'TCP',
      visibility: 'public',
      publicUrl: 'https://xyz789.ngrok.io',
      status: 'active',
      createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
    }
  ]);
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [forwardingPort, setForwardingPort] = useState<number | null>(null);
  const [forwardingVisibility, setForwardingVisibility] = useState<'private' | 'public'>('public');

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

  const forwardPort = (port: number) => {
    setForwardingPort(port);
    setShowForwardDialog(true);
  };

  const confirmForwardPort = () => {
    if (forwardingPort) {
      // Generate a random public URL (simulating ngrok-like service)
      const randomId = Math.random().toString(36).substring(2, 8);
      const publicUrl = `https://${randomId}.ngrok.io`;
      
      const newForwardedPort: ForwardedPort = {
        localPort: forwardingPort,
        publicPort: Math.floor(Math.random() * 1000) + 8000,
        protocol: 'TCP',
        visibility: forwardingVisibility,
        publicUrl,
        status: 'active',
        createdAt: new Date(),
      };
      
      setForwardedPorts(prev => [...prev, newForwardedPort]);
      setShowForwardDialog(false);
      setForwardingPort(null);
      setForwardingVisibility('public');
      toast.success(`Port ${forwardingPort} forwarded successfully!`);
    }
  };

  const copyPublicUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Public URL copied to clipboard!');
  };

  const togglePortVisibility = (localPort: number) => {
    setForwardedPorts(prev => 
      prev.map(fp => 
        fp.localPort === localPort 
          ? { ...fp, visibility: fp.visibility === 'private' ? 'public' : 'private' }
          : fp
      )
    );
    toast.success(`Port ${localPort} visibility updated!`);
  };

  const stopPortForward = (localPort: number) => {
    setForwardedPorts(prev => prev.filter(fp => fp.localPort !== localPort));
    toast.info(`Port ${localPort} forwarding stopped`);
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
                   <div className="mt-2 flex justify-end">
                     <PanelHeaderButton
                       onClick={() => forwardPort(port.port)}
                       className="text-xs"
                       disabled={forwardedPorts.some(fp => fp.localPort === port.port)}
                     >
                       <div className="i-ph:arrow-up-right" />
                       {forwardedPorts.some(fp => fp.localPort === port.port) ? 'Forwarded' : 'Forward Port'}
                     </PanelHeaderButton>
                   </div>
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

          {/* Forwarded Ports Section */}
          <div className="col-span-1 lg:col-span-2 bg-bolt-elements-background-depth-3 rounded-lg p-4 overflow-hidden">
            <h3 className="text-md font-medium text-bolt-elements-textPrimary mb-3">Forwarded Ports</h3>
            <div className="overflow-y-auto max-h-64">
              {forwardedPorts.length === 0 ? (
                <div className="text-center text-bolt-elements-textSecondary py-8">
                  <div className="i-ph:arrow-up-right text-4xl mb-2 opacity-50" />
                  <p>No ports forwarded yet</p>
                  <p className="text-xs">Click "Forward Port" on any open port to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {forwardedPorts.map((fp) => (
                    <div
                      key={fp.localPort}
                      className="p-3 rounded-lg border border-bolt-elements-borderColor hover:border-bolt-elements-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={classNames('text-lg', getStatusColor(fp.status))}>
                            <div className={getStatusIcon(fp.status)} />
                          </div>
                          <div>
                            <div className="font-medium text-bolt-elements-textPrimary">
                              Local Port {fp.localPort} → Public Port {fp.publicPort}
                            </div>
                            <div className="text-xs text-bolt-elements-textSecondary">
                              {fp.protocol} • {fp.visibility} • Created {fp.createdAt.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={classNames(
                            'px-2 py-1 rounded text-xs font-medium',
                            fp.visibility === 'public' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          )}>
                            {fp.visibility}
                          </div>
                          <IconButton
                            icon="i-ph:copy"
                            size="sm"
                            onClick={() => copyPublicUrl(fp.publicUrl)}
                            title="Copy public URL"
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs text-bolt-elements-textSecondary font-mono bg-bolt-elements-background-depth-4 px-2 py-1 rounded">
                          {fp.publicUrl}
                        </div>
                        <div className="flex gap-1">
                          <PanelHeaderButton
                            onClick={() => togglePortVisibility(fp.localPort)}
                            className="text-xs"
                          >
                            <div className="i-ph:eye" />
                            {fp.visibility === 'private' ? 'Make Public' : 'Make Private'}
                          </PanelHeaderButton>
                          <PanelHeaderButton
                            onClick={() => stopPortForward(fp.localPort)}
                            className="text-xs"
                          >
                            <div className="i-ph:stop" />
                            Stop
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

        {/* Port Forwarding Dialog */}
        {showForwardDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">
                Forward Port {forwardingPort}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">
                    Visibility
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setForwardingVisibility('private')}
                      className={classNames(
                        'px-3 py-2 rounded text-sm font-medium transition-colors',
                        forwardingVisibility === 'private'
                          ? 'bg-bolt-elements-accent text-white'
                          : 'bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-4'
                      )}
                    >
                      Private
                    </button>
                    <button
                      onClick={() => setForwardingVisibility('public')}
                      className={classNames(
                        'px-3 py-2 rounded text-sm font-medium transition-colors',
                        forwardingVisibility === 'public'
                          ? 'bg-bolt-elements-accent text-white'
                          : 'bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-4'
                      )}
                    >
                      Public
                    </button>
                  </div>
                </div>

                <div className="text-sm text-bolt-elements-textSecondary">
                  <p className="mb-2">
                    <strong>Private:</strong> Only accessible from your local network
                  </p>
                  <p>
                    <strong>Public:</strong> Accessible from anywhere on the internet
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowForwardDialog(false);
                    setForwardingPort(null);
                    setForwardingVisibility('public');
                  }}
                  className="flex-1 px-4 py-2 rounded text-sm font-medium bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-4 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmForwardPort}
                  className="flex-1 px-4 py-2 rounded text-sm font-medium bg-bolt-elements-accent text-white hover:bg-bolt-elements-accent/90 transition-colors"
                >
                  Forward Port
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});