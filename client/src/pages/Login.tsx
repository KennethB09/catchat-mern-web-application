import { useToastContext } from '@/hooks/useToast';
import catGif from '../assets/gif/Sleeping Cat.gif';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { useGoogleSigIn } from '@/hooks/useOAuthSignIn';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export default function Login() {
    const { login, error, isLoading } = useLogin();
    const { GoogleLogin, oAuthError, oAuthLoading, googleLoginError } = useGoogleSigIn();
    const { toast } = useToastContext();

    const formSchema = z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters long')
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await login(values.email, values.password);
        } catch (error) {
            console.error(error);
            toast({
                title: 'Ops, something went wrong',
                description: `${error}`,
                variant: 'destructive',
            })
        }
    };

    return (
        <section className='w-screen h-screen flex flex-col sm:flex-row item-center justify-center'>
            <div className='flex flex-col item-center justify-center py-4 px-8 gap-16 lg:w-[45%]'>
                <Form {...form}>
                    <div className='text-center'>
                        <h1 className='text-4xl font-bold text-orange-500'>Welcome Back</h1>
                        <p className='text-base text-gray-500 dark:text-slate-100'>Sign to continue</p>
                    </div>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='text-orange-500'>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='text-orange-500'>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className='bg-orange-500 w-full text-slate-50' disabled={isLoading || oAuthLoading}>
                            {isLoading ? 
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity="0.25" /><path fill="currentColor" d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"><animateTransform attributeName="transform" dur="1.125s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12" /></path>
                                </svg>
                                :
                                'Login'
                            }
                        </Button>
                        {error && <p className='text-red-500'>{error}</p>}
                        <div className='text-center'>
                            <small className='text-gray-400'>OR</small>
                        </div>
                        {GoogleLogin}
                        {googleLoginError !== '' && <p className='text-red-500 font-semibold'>{googleLoginError}</p>}
                        {oAuthError !== '' && <p className='text-red-500 font-semibold'>{oAuthError}</p>}
                        <FormDescription>Don't have an account? <Link className='text-orange-500 font-bold' to='/sign-up'>Sign-up</Link></FormDescription>
                    </form>
                </Form>
            </div>

            <div className='hidden sm:w-full sm:block'>
                <img src={catGif} alt='Sleeping Cat designed by Elen Winata' className='w-full h-full' />
            </div>

        </section>
    );
}