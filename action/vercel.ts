"use server";
import env from "@/env";
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: env.vercel.authToken,
});

export const setupDomainWithRedirect = async (userDomain: string) => {
  try {
    // Add main domain
    const mainDomainResponse = await vercel.projects.addProjectDomain({
      idOrName: env.vercel.projectId,
      requestBody: {
        name: userDomain,
      },
    });

    console.log(`Main domain added: ${mainDomainResponse}`);

    const checkConfiguration = await vercel.domains.getDomainConfig({
      domain: userDomain,
    });

    console.log(`Domain configuration: ${JSON.stringify(checkConfiguration)}`);

    return {
      status: 200,
      mainDomainResponse,
      checkConfiguration,
    };
  } catch (error) {
    console.error(
      error instanceof Error ? `Error: ${error.message}` : String(error)
    );
    return {
      status: 500,
      error,
    };
  }
};

export const checkDomainConfig = async (userDomain: string) => {
  try {
    // Add main domain
    const checkConfiguration = await vercel.domains.getDomainConfig({
      domain: userDomain,
    });

    // console.log(`Domain configuration: ${JSON.stringify(checkConfiguration)}`);

    return {
      status: 200,
      checkConfiguration,
    };
  } catch (error) {
    console.error(
      error instanceof Error ? `Error: ${error.message}` : String(error)
    );
    return {
      status: 500,
      error,
    };
  }
};



export const  vercelDomainStatus = async (company:string, domain:string) => {
  let domainRes;
  const domainUrl = `https://api.vercel.com/v10/domains/${domain}/config`;
  const domainUrlError = `failed get status for custom domain "${domain}" for username: ${company}`;
  let domainJson;
  try {
    domainRes = await fetch(domainUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.vercel.authToken}`,
        "Content-Type": "application/json",
      },
    });
    domainJson = await domainRes.json();
   
  } catch (e) {
    console.error(e, domainUrlError);
    return { error: domainUrlError };
  }

  if (domainJson.error) {
    console.error(domainUrlError);
    return { error: domainUrlError };
  }

  return domainJson;
}
