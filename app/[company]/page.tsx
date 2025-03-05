import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ company: string }>;
}

const page = async({params}: Props) => {
  const {company} = await params;
  
  redirect(`/${company}/dashboard`)
}

export default page;