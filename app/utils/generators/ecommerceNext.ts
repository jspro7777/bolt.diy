export interface ProductInput {
  id: string;
  name: string;
  price: number; // in cents
  currency: string; // e.g., USD, EUR
  description?: string;
  image: string; // URL o data URL
}

export interface WizardData {
  name: string;
  slug: string;
  products: ProductInput[];
  primaryColor: string;
  accentColor: string;
  logoDataUrl?: string;
  useStripeConnect: boolean;
}

export interface GeneratedFile {
  filePath: string;
  content: string;
}

const escapeJson = (value: string) => value.replace(/\\/g, "\\\\").replace(/\"/g, '\\"');

const makePackageJson = (slug: string) => `{
  "name": "${slug}",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "stripe": "^15.11.0",
    "@stripe/stripe-js": "^3.5.0"
  },
  "devDependencies": {
    "typescript": "^5.7.2"
  }
}`;

const makeNextConfig = () => `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true
  }
};

export default nextConfig;
`;

const makeTsconfig = () => `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}`;

const makeEnvExample = () => `# Stripe keys
STRIPE_SECRET_KEY=sk_********
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_********
# Optional (Connect)
PLATFORM_STRIPE_SECRET_KEY=sk_********
# App URL for redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Webhook secret (after you configure it in Stripe)
STRIPE_WEBHOOK_SECRET=whsec_********
`;

const makeGitignore = () => `node_modules
.next
out
.env
.env.*
.DS_Store
`;

const makeVercelJson = () => `{
  "functions": {
    "app/api/stripe/webhook/route.ts": {
      "maxDuration": 10
    }
  }
}`;

const makeGlobalsCss = (primary: string, accent: string) => `:root {\n  --primary: ${primary};\n  --accent: ${accent};\n}\n\n* { box-sizing: border-box; }\nhtml, body {\n  padding: 0;\n  margin: 0;\n  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";\n}\n\na { color: inherit; text-decoration: none; }\n\nbutton {\n  background: var(--primary);\n  color: white;\n  border: 0;\n  border-radius: 8px;\n  padding: 10px 14px;\n  cursor: pointer;\n}\n\nheader {\n  border-bottom: 1px solid #eee;\n  padding: 12px 16px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.container {\n  max-width: 1024px;\n  margin: 0 auto;\n  padding: 24px;\n}\n\n.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));\n  gap: 16px;\n}\n\n.card {\n  border: 1px solid #eee;\n  border-radius: 12px;\n  padding: 16px;\n}\n\ninput, select, textarea {\n  width: 100%;\n  padding: 8px 10px;\n  border-radius: 8px;\n  border: 1px solid #ddd;\n}\n\nlabel {\n  font-size: 12px;\n  color: #666;\n}\n`;

const makeLayout = (storeName: string, logoDataUrl?: string) => `export const metadata = { title: "${storeName}", description: "${storeName} Store" };
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            ${logoDataUrl ? `<img src="${logoDataUrl}" alt="logo" style={{ height: 28 }} />` : ''}
            <a href="/" style={{ fontWeight: 700 }}>{"${storeName}"}</a>
          </div>
          <nav style={{ display: 'flex', gap: 12 }}>
            <a href="/admin"><button style={{ background: 'var(--accent)' }}>Admin</button></a>
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            ${logoDataUrl ? `<img src="${logoDataUrl}" alt="logo" style={{ height: 20 }} />` : ''}
            <span style={{ fontWeight: 700 }}>{"${storeName}"}</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
`;

const makeLibProducts = (products: ProductInput[]) => `export interface Product { id: string; name: string; price: number; currency: string; description?: string; image: string }
export const products: Product[] = ${JSON.stringify(products, null, 2)};
`;

const makeHomePage = () => `import Link from "next/link";
import { products } from "@/lib/products";

function formatPrice(amount: number, currency: string) {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount / 100); } catch { return (amount/100).toFixed(2) + ' ' + currency; }
}

export default function Page() {
  return (
    <div>
      <h1 style={{ marginBottom: 12 }}>Productos</h1>
      <div className="grid">
        {products.map((p) => (
          <div key={p.id} className="card">
            <div style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: 8, marginBottom: 10 }}>
              <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div style={{ color: '#666', fontSize: 13 }}>{p.description || ''}</div>
            <div style={{ marginTop: 8, marginBottom: 12 }}>{formatPrice(p.price, p.currency)}</div>
            <form action="/api/checkout" method="post">
              <input type="hidden" name="productId" value={p.id} />
              <button type="submit">Comprar ahora</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
`;

const makeStripeLib = () => `import Stripe from 'stripe';

export function getStripe(secret?: string) {
  const key = secret || process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }
  return new Stripe(key, { apiVersion: '2024-06-20' });
}
`;

const makeCheckoutRoute = () => `import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { products } from '@/lib/products';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const productId = String(form.get('productId'));
  const product = products.find((p) => p.id === productId);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const stripe = getStripe();
  const origin = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: product.currency,
          product_data: { name: product.name, images: [product.image] },
          unit_amount: product.price,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/?success=true`,
    cancel_url: `${origin}/?canceled=true`,
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
`;

const makeConnectRoute = () => `import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const stripe = getStripe(process.env.PLATFORM_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY);
  const origin = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'http://localhost:3000';

  const account = await stripe.accounts.create({ type: 'express' });
  const link = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${origin}/admin?connect=refresh`,
    return_url: `${origin}/admin?connect=return`,
    type: 'account_onboarding',
  });

  return NextResponse.json({ url: link.url });
}
`;

const makeWebhookRoute = () => `import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const buf = await req.text();
  const signature = (await headers()).get('stripe-signature');
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

  if (!signature || !endpointSecret) return NextResponse.json({ received: true });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, signature, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle event types here if needed
  switch (event.type) {
    case 'checkout.session.completed': {
      // const session = event.data.object as Stripe.Checkout.Session;
      break;
    }
  }

  return NextResponse.json({ received: true });
}
`;

const makeAdminPage = () => `'use client';
import { useState } from 'react';
import { products as initialProducts } from '@/lib/products';

export default function Admin() {
  const [products, setProducts] = useState(initialProducts);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  const addProduct = () => {
    if (!name || !price) return;
    setProducts((prev) => [
      ...prev,
      { id: String(Date.now()), name, price: Math.round(Number(price)), currency, description, image },
    ]);
    setName(''); setPrice(0); setCurrency('USD'); setImage(''); setDescription('');
  };

  const connectStripe = async () => {
    const resp = await fetch('/api/stripe/connect', { method: 'POST' });
    const data = await resp.json();
    if (data?.url) window.location.href = data.url;
  };

  return (
    <div>
      <h1 style={{ marginBottom: 12 }}>Admin básico</h1>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Conectar pagos</h3>
        <p>Configura Stripe y conecta tu cuenta para aceptar pagos.</p>
        <button onClick={connectStripe}>Conectar pagos</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Agregar producto</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label>Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>Precio (centavos)</label>
            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <div>
            <label>Moneda</label>
            <input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} />
          </div>
          <div>
            <label>Imagen (URL o data URL)</label>
            <input value={image} onChange={(e) => setImage(e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={addProduct}>Agregar</button>
        </div>
      </div>

      <div className="grid">
        {products.map((p) => (
          <div key={p.id} className="card">
            <div style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: 8, marginBottom: 10 }}>
              <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div style={{ color: '#666', fontSize: 13 }}>{p.description || ''}</div>
            <div style={{ marginTop: 8 }}>{new Intl.NumberFormat(undefined, { style: 'currency', currency: p.currency }).format(p.price/100)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
`;

const makeReadme = (storeName: string) => `# ${storeName}

Tienda e-commerce generada automáticamente (Next.js + Stripe Checkout + Admin básico).

## Desarrollo

1. Copia `.concat("`", ".env.example", "`", ` a `.concat("`", ".env", "`", `) y rellena las claves.
2. Instala dependencias y ejecuta:

	npm install
	npm run dev

## Stripe
- Usa STRIPE_SECRET_KEY y NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- Botón "Conectar pagos" crea un onboarding link (Stripe Connect Express)
- Webhooks: configura STRIPE_WEBHOOK_SECRET

## Despliegue en Vercel
- Proyecto listo para importar en Vercel.
- Añade las variables de entorno en Vercel y despliega.
`);

export function generateNextEcommerceFiles(data: WizardData): GeneratedFile[] {
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const base = slug;

  const files: GeneratedFile[] = [];

  files.push({ filePath: `${base}/package.json`, content: makePackageJson(slug) });
  files.push({ filePath: `${base}/next.config.mjs`, content: makeNextConfig() });
  files.push({ filePath: `${base}/tsconfig.json`, content: makeTsconfig() });
  files.push({ filePath: `${base}/.gitignore`, content: makeGitignore() });
  files.push({ filePath: `${base}/vercel.json`, content: makeVercelJson() });
  files.push({ filePath: `${base}/.env.example`, content: makeEnvExample() });

  files.push({ filePath: `${base}/app/globals.css`, content: makeGlobalsCss(data.primaryColor, data.accentColor) });
  files.push({ filePath: `${base}/app/layout.tsx`, content: makeLayout(data.name, data.logoDataUrl) });
  files.push({ filePath: `${base}/app/page.tsx`, content: makeHomePage() });

  files.push({ filePath: `${base}/lib/stripe.ts`, content: makeStripeLib() });
  files.push({ filePath: `${base}/lib/products.ts`, content: makeLibProducts(data.products) });

  files.push({ filePath: `${base}/app/api/checkout/route.ts`, content: makeCheckoutRoute() });
  files.push({ filePath: `${base}/app/api/stripe/connect/route.ts`, content: makeConnectRoute() });
  files.push({ filePath: `${base}/app/api/stripe/webhook/route.ts`, content: makeWebhookRoute() });

  files.push({ filePath: `${base}/README.md`, content: makeReadme(data.name) });

  // Optional: simple logo placeholder if no logo data url (as inline SVG)
  if (!data.logoDataUrl) {
    const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"40\" viewBox=\"0 0 160 40\"><rect width=\"160\" height=\"40\" rx=\"8\" fill=\"${data.primaryColor}\"/><text x=\"50%\" y=\"50%\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"white\" font-size=\"16\" font-family=\"Arial, sans-serif\">${escapeJson(
      data.name,
    )}</text></svg>`;
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    files.push({ filePath: `${base}/public/logo.svg`, content: svg });
    // also update layout to use this logo data url
    files.push({ filePath: `${base}/app/layout.tsx`, content: makeLayout(data.name, data.logoDataUrl || dataUrl) });
  }

  return files;
}