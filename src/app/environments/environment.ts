export const environment = {
    production: false,
    apiUrl: '/api', // URL relativa para desenvolvimento local
    //apiUrlAbsolute: 'https://www.fiberworks-quantum.com:3001', // URL absoluta segura para testes diretos
    apiUrlAbsolute: 'https://www.fiberworks-api.com:3001', // URL absoluta segura para testes diretos
    rbxSyncMaxClientes: 1000, // 0 = sem limite; teste inicial com 5 códigos
    vigoSyncMaxClientes: 400, // 0 = sem limite; modo teste em dev
    vigoSyncMaxCaixasLogin: 10, // IDs VIGO consultados por login (a partir do último ID_INTEGRACAO)

    //googleMapsApiKey: 'AIzaSyCfJrOfhVGCOKdAOz1LagKl7yi4PAWLQ8Q' // Chave para desenvolvimento local
  };