export interface AuthDto
{
    id: number,
    login: string,
    password? : string, // not needed?
    email: string,
    img_url: string,
}