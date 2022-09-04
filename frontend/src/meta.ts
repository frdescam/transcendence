export interface MetaData {
	title: string,
	titleTemplate(str: string): string
}

const EMPTY = '___EMPTY___';

const generateMeta = (title?: string): MetaData =>
{
	const data = {} as MetaData;
	data.title = (title) || EMPTY;
	data.titleTemplate = (str: string) => (str !== EMPTY) ? `${str} - Transcendance` : 'Transcendance';
	return data;
};

export { generateMeta };
