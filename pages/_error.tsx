import type { NextPageContext } from "next";

interface ErrorPageProps {
  statusCode?: number;
}

function ErrorPage({ statusCode }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Algo deu errado</h1>
        <p className="text-sm text-muted-foreground">
          {statusCode
            ? `Erro ${statusCode} ao carregar a página.`
            : "Ocorreu um erro inesperado no cliente."}
        </p>
      </div>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};

export default ErrorPage;
