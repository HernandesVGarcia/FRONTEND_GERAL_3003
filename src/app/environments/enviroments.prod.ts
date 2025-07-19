export const environment = {
    production: true,
    apiUrl: '/api', // URL relativa em produção
    apiUrlAbsolute: 'https://www.fiberworks-quantum.com:3001' ,// URL absoluta segura

    googleMapsApiKey: (globalThis as any).GOOGLE_MAPS_API_KEY // Chave do Amplify para produção
  };