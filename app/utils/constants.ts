import type { IProviderSetting } from '~/types/model';

import { LLMManager } from '~/lib/modules/llm/manager';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { Template } from '~/types/template';

export const WORK_DIR_NAME = 'project';
export const WORK_DIR = `/home/${WORK_DIR_NAME}`;
export const MODIFICATIONS_TAG_NAME = 'bolt_file_modifications';
export const MODEL_REGEX = /^\[Model: (.*?)\]\n\n/;
export const PROVIDER_REGEX = /\[Provider: (.*?)\]\n\n/;
export const DEFAULT_MODEL = 'claude-3-5-sonnet-latest';
export const PROMPT_COOKIE_KEY = 'cachedPrompt';

const llmManager = LLMManager.getInstance(import.meta.env);

export const PROVIDER_LIST = llmManager.getAllProviders();
export const DEFAULT_PROVIDER = llmManager.getDefaultProvider();

let MODEL_LIST = llmManager.getModelList();

const providerBaseUrlEnvKeys: Record<string, { baseUrlKey?: string; apiTokenKey?: string }> = {};
PROVIDER_LIST.forEach((provider) => {
  providerBaseUrlEnvKeys[provider.name] = {
    baseUrlKey: provider.config.baseUrlKey,
    apiTokenKey: provider.config.apiTokenKey,
  };
});

// Export the getModelList function using the manager
export async function getModelList(options: {
  apiKeys?: Record<string, string>;
  providerSettings?: Record<string, IProviderSetting>;
  serverEnv?: Record<string, string>;
}) {
  return await llmManager.updateModelList(options);
}

async function initializeModelList(options: {
  env?: Record<string, string>;
  providerSettings?: Record<string, IProviderSetting>;
  apiKeys?: Record<string, string>;
}): Promise<ModelInfo[]> {
  const { providerSettings, apiKeys, env } = options;
  const list = await getModelList({
    apiKeys,
    providerSettings,
    serverEnv: env,
  });
  MODEL_LIST = list || MODEL_LIST;

  return list;
}

// initializeModelList({})
export { initializeModelList, providerBaseUrlEnvKeys, MODEL_LIST };

// starter Templates

export const STARTER_TEMPLATES: Template[] = [
  {
    name: 'bolt-nextjs-ecommerce',
    label: 'Next.js E-commerce',
    description: 'Generador de tienda online (Next.js + Stripe Checkout + Admin básico)',
    githubRepo: 'example/nextjs-ecommerce-template',
    tags: ['ecommerce', 'nextjs', 'stripe'],
    icon: 'i-bolt:nextjs',
  },
];
