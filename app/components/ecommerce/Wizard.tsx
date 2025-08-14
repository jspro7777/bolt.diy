import React, { useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { workbenchStore } from '~/lib/stores/workbench';
import { WORK_DIR } from '~/utils/constants';
import { generateNextEcommerceFiles, type ProductInput, type WizardData } from '~/utils/generators/ecommerceNext';
import RunButtons from './RunButtons';

interface ProductForm extends Omit<ProductInput, 'id'> {}

const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function EcommerceWizard() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Glup');
  const [primaryColor, setPrimaryColor] = useState('#111827');
  const [accentColor, setAccentColor] = useState('#2563EB');
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);
  const [useStripeConnect, setUseStripeConnect] = useState(true);

  const [products, setProducts] = useState<ProductForm[]>([
    { name: 'Producto A', price: 1999, currency: 'USD', description: 'Descripción', image: 'https://picsum.photos/seed/a/600/400' },
    { name: 'Producto B', price: 2999, currency: 'USD', description: 'Descripción', image: 'https://picsum.photos/seed/b/600/400' },
  ]);

  const [generatedDir, setGeneratedDir] = useState<string | undefined>(undefined);

  const slug = useMemo(() => toSlug(name || 'tienda'), [name]);

  const addProduct = () => setProducts((p) => [...p, { name: '', price: 1000, currency: 'USD', description: '', image: '' }]);
  const removeProduct = (idx: number) => setProducts((p) => p.filter((_, i) => i !== idx));

  const onLogoChange = async (file?: File) => {
    if (!file) { setLogoDataUrl(undefined); return; }
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    const data: WizardData = {
      name,
      slug,
      products: products.map((p, i) => ({ id: String(i + 1), ...p })),
      primaryColor,
      accentColor,
      logoDataUrl,
      useStripeConnect,
    };

    const files = generateNextEcommerceFiles(data);

    const messageId = `msg_${Date.now()}`;
    const artifactId = `artifact_${Date.now()}`;

    workbenchStore.addArtifact({ messageId, id: artifactId, title: `${name} (Next.js + Stripe)`, type: 'bundled' });

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const actionId = String(i);
      const filePath = `${WORK_DIR}/${f.filePath}`;

      workbenchStore.addAction({
        artifactId,
        messageId,
        actionId,
        action: { type: 'file', filePath, content: f.content },
      });
      await workbenchStore.runAction({
        artifactId,
        messageId,
        actionId,
        action: { type: 'file', filePath, content: f.content },
      });
    }

    workbenchStore.setShowWorkbench(true);
    setGeneratedDir(`${WORK_DIR}/${slug}`);
  };

  const handlePushGitHub = async () => {
    const repo = `${slug}`;
    try {
      await workbenchStore.pushToGitHub(repo);
      const owner = Cookies.get('githubUsername');
      if (owner) {
        const url = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(`https://github.com/${owner}/${repo}`)}`;
        window.open(url, '_blank');
      }
    } catch (e) {
      console.error(e);
      alert('Error al subir a GitHub. Asegúrate de configurar token y usuario.');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 960 }}>
      <h1 style={{ marginBottom: 8 }}>Generador de tienda online</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Next.js + Stripe Checkout + Admin básico</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Paso 1: Nombre</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <div>
            <label>Nombre de la tienda</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Glup" />
          </div>
          <div>
            <label>Slug</label>
            <input value={slug} readOnly />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Paso 2: Productos iniciales</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {products.map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.6fr 1fr 1fr auto', gap: 8 }}>
              <input placeholder="Nombre" value={p.name} onChange={(e) => setProducts((arr) => (arr.map((it, idx) => idx === i ? { ...it, name: e.target.value } : it)))} />
              <input type="number" placeholder="Precio (centavos)" value={p.price} onChange={(e) => setProducts((arr) => (arr.map((it, idx) => idx === i ? { ...it, price: Number(e.target.value) } : it)))} />
              <input placeholder="Moneda" value={p.currency} onChange={(e) => setProducts((arr) => (arr.map((it, idx) => idx === i ? { ...it, currency: e.target.value.toUpperCase() } : it)))} />
              <input placeholder="Imagen URL o data URL" value={p.image} onChange={(e) => setProducts((arr) => (arr.map((it, idx) => idx === i ? { ...it, image: e.target.value } : it)))} />
              <input placeholder="Descripción" value={p.description} onChange={(e) => setProducts((arr) => (arr.map((it, idx) => idx === i ? { ...it, description: e.target.value } : it)))} />
              <button onClick={() => removeProduct(i)} style={{ background: '#ef4444' }}>Eliminar</button>
            </div>
          ))}
          <div>
            <button onClick={addProduct} style={{ background: 'var(--accent)' }}>Agregar producto</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Paso 3: Colores</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label>Primario</label>
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
          </div>
          <div>
            <label>Acento</label>
            <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Paso 4: Logo</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="file" accept="image/*" onChange={(e) => onLogoChange(e.target.files?.[0])} />
          {logoDataUrl && <img src={logoDataUrl} alt="logo" style={{ height: 36 }} />}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Pagos</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input id="connect" type="checkbox" checked={useStripeConnect} onChange={(e) => setUseStripeConnect(e.target.checked)} />
          <label htmlFor="connect">Incluir botón "Conectar pagos" (Stripe Connect)</label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={handleGenerate}>Generar tienda</button>
        <button onClick={handlePushGitHub} style={{ background: '#111827' }}>Subir a GitHub y desplegar en Vercel</button>
      </div>

      {generatedDir && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Proyecto generado</h3>
          <p>Directorio: <code>{generatedDir}</code></p>
          <RunButtons projectDir={generatedDir} />
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Configurar GitHub (opcional)</h3>
        <p>Guarda tu token y usuario de GitHub para poder subir el repo automáticamente.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label>Usuario GitHub</label>
            <input defaultValue={Cookies.get('githubUsername') || ''} onBlur={(e) => Cookies.set('githubUsername', e.target.value)} placeholder="tu-usuario" />
          </div>
          <div>
            <label>Token GitHub (repo)</label>
            <input defaultValue={Cookies.get('githubToken') || ''} onBlur={(e) => Cookies.set('githubToken', e.target.value)} placeholder="ghp_..." />
          </div>
        </div>
      </div>
    </div>
  );
}