export interface Token {
    token: string;
    usuario?: {
        id?: number;
        nome?: string;
        email?: string;
    };
    mensagem?: string;
}