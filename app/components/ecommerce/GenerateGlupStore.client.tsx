import React, { useEffect } from 'react';
import { workbenchStore } from '~/lib/stores/workbench';
import { WORK_DIR } from '~/utils/constants';
import { generateNextEcommerceFiles, type WizardData } from '~/utils/generators/ecommerceNext';

export default function GenerateGlupStore() {
	useEffect(() => {
		(async () => {
			const data: WizardData = {
				name: 'Glup',
				slug: 'glup',
				products: [
					{ id: '1', name: 'Producto A', price: 1999, currency: 'USD', description: 'Descripción', image: '/brand/images/product-1.svg' },
					{ id: '2', name: 'Producto B', price: 2999, currency: 'USD', description: 'Descripción', image: '/brand/images/product-2.svg' },
					{ id: '3', name: 'Producto C', price: 3999, currency: 'USD', description: 'Descripción', image: '/brand/images/product-3.svg' },
				],
				primaryColor: '#111827',
				accentColor: '#2563EB',
				logoDataUrl: '/brand/logo.svg',
				useStripeConnect: true,
			};

			const files = generateNextEcommerceFiles(data);
			const messageId = `msg_gen_${Date.now()}`;
			const artifactId = `artifact_gen_${Date.now()}`;

			workbenchStore.addArtifact({ messageId, id: artifactId, title: `Glup (Next.js + Stripe)`, type: 'bundled' });

			for (let i = 0; i < files.length; i++) {
				const f = files[i];
				const actionId = String(i);
				const filePath = `${WORK_DIR}/${f.filePath}`;

				workbenchStore.addAction({ artifactId, messageId, actionId, action: { type: 'file', filePath, content: f.content } });
				await workbenchStore.runAction({ artifactId, messageId, actionId, action: { type: 'file', filePath, content: f.content } });
			}

			// Copiar imágenes de marca al proyecto generado
			const brandFiles = [
				{ path: 'public/brand/logo.svg', content: `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"40\" viewBox=\"0 0 160 40\"><defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0%\" stop-color=\"#2563EB\"/><stop offset=\"100%\" stop-color=\"#111827\"/></linearGradient></defs><rect width=\"160\" height=\"40\" rx=\"8\" fill=\"url(#g)\"/><text x=\"50%\" y=\"50%\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"white\" font-size=\"18\" font-family=\"Inter, Arial, sans-serif\">Glup</text></svg>` },
				{ path: 'public/brand/images/banner-1.svg', content: `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1200\" height=\"400\" viewBox=\"0 0 1200 400\"><defs><linearGradient id=\"bg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0%\" stop-color=\"#F3F4F6\"/><stop offset=\"100%\" stop-color=\"#E5E7EB\"/></linearGradient><linearGradient id=\"accent\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0%\" stop-color=\"#9CA3AF\"/><stop offset=\"100%\" stop-color=\"#6B7280\"/></linearGradient></defs><rect width=\"1200\" height=\"400\" fill=\"url(#bg)\"/><g transform=\"translate(80, 80)\"><rect x=\"0\" y=\"0\" width=\"460\" height=\"240\" rx=\"16\" fill=\"white\" stroke=\"#E5E7EB\"/><rect x=\"520\" y=\"0\" width=\"460\" height=\"100\" rx=\"12\" fill=\"white\" stroke=\"#E5E7EB\"/><rect x=\"520\" y=\"120\" width=\"300\" height=\"40\" rx=\"8\" fill=\"url(#accent)\"/><rect x=\"520\" y=\"180\" width=\"220\" height=\"40\" rx=\"8\" fill=\"#D1D5DB\"/></g></svg>` },
				{ path: 'public/brand/images/banner-2.svg', content: `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1200\" height=\"400\" viewBox=\"0 0 1200 400\"><defs><linearGradient id=\"bg2\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0%\" stop-color=\"#F9FAFB\"/><stop offset=\"100%\" stop-color=\"#F3F4F6\"/></linearGradient></defs><rect width=\"1200\" height=\"400\" fill=\"url(#bg2)\"/><g transform=\"translate(80, 80)\"><rect x=\"0\" y=\"0\" width=\"1040\" height=\"80\" rx=\"12\" fill=\"#E5E7EB\"/><rect x=\"0\" y=\"110\" width=\"320\" height=\"210\" rx=\"16\" fill=\"white\" stroke=\"#E5E7EB\"/><rect x=\"340\" y=\"110\" width=\"320\" height=\"210\" rx=\"16\" fill=\"white\" stroke=\"#E5E7EB\"/><rect x=\"680\" y=\"110\" width=\"360\" height=\"100\" rx=\"12\" fill=\"white\" stroke=\"#E5E7EB\"/><rect x=\"680\" y=\"230\" width=\"260\" height=\"40\" rx=\"8\" fill=\"#D1D5DB\"/></g></svg>` },
				{ path: 'public/brand/images/product-1.svg', content: `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"600\" height=\"400\" viewBox=\"0 0 600 400\"><defs><linearGradient id=\"pbg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0%\" stop-color=\"#F3F4F6\"/><stop offset=\"100%\" stop-color=\"#E5E7EB\"/></linearGradient></defs><rect width=\"600\" height=\"400\" rx=\"16\" fill=\"url(#pbg)\"/><circle cx=\"300\" cy=\"180\" r=\"80\" fill=\"#D1D5DB\"/><rect x=\"180\" y=\"300\" width=\"240\" height=\"28\" rx=\"6\" fill=\"#9CA3AF\"/></svg>` },
				{ path: 'public/brand/images/product-2.svg', content: `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"600\" height=\"400\" viewBox=\"0 0 600 400\"><defs><linearGradient id=\"pbg2\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0%\" stop-color=\"#F9FAFB\"/><stop offset=\"100%\" stop-color=\"#F3F4F6\"/></linearGradient></defs><rect width=\"600\" height=\"400\" rx=\"16\" fill=\"url(#pbg2)\"/><rect x=\"180\" y=\"120\" width=\"240\" height=\"160\" rx=\"16\" fill=\"#D1D5DB\"/><rect x=\"200\" y=\"300\" width=\"200\" height=\"28\" rx=\"6\" fill=\"#9CA3AF\"/></svg>` },
				{ path: 'public/brand/images/product-3.svg', content: `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"600\" height=\"400\" viewBox=\"0 0 600 400\"><defs><linearGradient id=\"pbg3\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0%\" stop-color=\"#F3F4F6\"/><stop offset=\"100%\" stop-color=\"#E5E7EB\"/></linearGradient></defs><rect width=\"600\" height=\"400\" rx=\"16\" fill=\"url(#pbg3)\"/><rect x=\"140\" y=\"100\" width=\"320\" height=\"200\" rx=\"12\" fill=\"#D1D5DB\"/><rect x=\"170\" y=\"320\" width=\"260\" height=\"24\" rx=\"6\" fill=\"#9CA3AF\"/></svg>` },
			];

			for (let i = 0; i < brandFiles.length; i++) {
				const bf = brandFiles[i];
				const filePath = `${WORK_DIR}/glup/${bf.path}`;
				const actionId = `b${i}`;
				workbenchStore.addAction({ artifactId, messageId, actionId, action: { type: 'file', filePath, content: bf.content } });
				await workbenchStore.runAction({ artifactId, messageId, actionId, action: { type: 'file', filePath, content: bf.content } });
			}

			workbenchStore.setShowWorkbench(true);
			workbenchStore.currentView.set('code');
		})();
	}, []);

	return null;
}