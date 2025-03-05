import { connectStripe } from '@/action/subscription';
import { redirect } from 'next/navigation';


type Props = {
  searchParams: Promise<{
    code?: string;
    state?: string;
  }>;
}

const page = async({searchParams}: Props) => {
  const { code, state } = await searchParams;
  if(!code || !state) {
    redirect("/");
  }
  console.log("Connecting business with code:", code, "and state:", state);
  const [subscriptionId, company] = state.split("company");
  const stripe = await connectStripe(code, subscriptionId);
  if(stripe.status !== 200) {
    redirect(`/${company}/settings?error=${encodeURIComponent("Failed to connect stripe")}`);
  }

  redirect(`/${company}/settings?success=${encodeURIComponent("Stripe connected successfully")}`);


}

export default page