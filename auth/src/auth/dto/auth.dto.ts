export interface AuthDto
{
    // maybe every random bs of her should be optionla ?
    id?: number; // dis needed?
    fortytwo_id?: number,
    pseudo?: string, // first time, same as pseudo, then could be changed so shouldnt use this to look in db!!
    email?: string,
    password? : string, // not needed?
    avatar?: string,
    refresh_token?: string, // needed???
}