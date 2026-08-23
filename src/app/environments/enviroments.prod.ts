export const environment = {
    production: true,
    apiUrl: '/api', // URL relativa em produção
    //apiUrlAbsolute: 'https://www.fiberworks-quantum.com:3001' ,// URL absoluta segura
    apiUrlAbsolute: 'https://www.fiberworks-api.com:3001', // URL absoluta segura para testes diretos
    rbxSyncMaxClientes: 0, // 0 = sem limite

    //googleMapsApiKey: (globalThis as any).GOOGLE_MAPS_API_KEY // Chave do Amplify para produção
  };