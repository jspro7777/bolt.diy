import React from 'react';
import { workbenchStore } from '~/lib/stores/workbench';

export default function RunButtons({ projectDir }: { projectDir: string }) {
	const handleInstall = async () => {
		const messageId = `msg_install_${Date.now()}`;
		const artifactId = `artifact_install_${Date.now()}`;
		workbenchStore.addArtifact({ messageId, id: artifactId, title: 'Instalar dependencias', type: 'bundled' });
		workbenchStore.addAction({
			artifactId,
			messageId,
			actionId: '0',
			action: { type: 'shell', content: `cd ${projectDir} && npm install` },
		});
		await workbenchStore.runAction({
			artifactId,
			messageId,
			actionId: '0',
			action: { type: 'shell', content: `cd ${projectDir} && npm install` },
		});
	};

	const handleDev = async () => {
		const messageId = `msg_dev_${Date.now()}`;
		const artifactId = `artifact_dev_${Date.now()}`;
		workbenchStore.addArtifact({ messageId, id: artifactId, title: 'Arrancar servidor', type: 'bundled' });
		workbenchStore.addAction({
			artifactId,
			messageId,
			actionId: '0',
			action: { type: 'start', content: `cd ${projectDir} && npm run dev | cat` },
		});
		await workbenchStore.runAction({
			artifactId,
			messageId,
			actionId: '0',
			action: { type: 'start', content: `cd ${projectDir} && npm run dev | cat` },
		});
		workbenchStore.setShowWorkbench(true);
		workbenchStore.currentView.set('preview');
	};

	return (
		<div style={{ display: 'flex', gap: 12 }}>
			<button onClick={handleInstall} style={{ background: '#111827' }}>Instalar</button>
			<button onClick={handleDev}>Iniciar dev</button>
		</div>
	);
}