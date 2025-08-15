import { json, type MetaFunction } from '@remix-run/cloudflare';
import { Header } from '~/components/header/Header';
import EcommerceWizard from '~/components/ecommerce/Wizard';
// import GenerateGlupStore from '~/components/ecommerce/GenerateGlupStore.client';

export const meta: MetaFunction = () => {
  return [{ title: 'Generador de Tiendas' }, { name: 'description', content: 'Crea tu tienda online con Next.js y Stripe' }];
};

export const loader = () => json({});

export default function Index() {
  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <Header />
      <EcommerceWizard />
      {/* <GenerateGlupStore /> */}
    </div>
  );
}
