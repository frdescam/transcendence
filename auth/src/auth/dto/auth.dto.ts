export interface AuthDto
{
    id: number,
    login: string, // first time, same as pseudo, then could be chanegd so shouldnt use this to look in db
    password? : string, // not needed?
    email: string,
    img_url: string,
}