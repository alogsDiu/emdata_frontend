import { getLocalizedContent } from '@/lib/i18n';

export default async function ForgotPassword({params}:{params:{locale:string}}){
    
    const content = await getLocalizedContent((await params).locale, 'forgotPassword');

    
}