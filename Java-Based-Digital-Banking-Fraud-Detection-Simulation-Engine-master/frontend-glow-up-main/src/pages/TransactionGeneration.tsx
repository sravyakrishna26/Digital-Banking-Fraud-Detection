import TransactionForm from "@/components/TransactionForm";
import AutoTransactionGenerator from "@/components/AutoTransactionGenerator";
import AppNavbar from "@/components/layout/AppNavbar";
import { Separator } from "@/components/ui/separator";

const TransactionGeneration = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppNavbar active="new-transaction" />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-8">
          {/* Manual Transaction Form Section */}
          <section className="animate-fade-in">
            <TransactionForm />
          </section>

          {/* Separator */}
          <Separator className="my-8" />

          {/* Auto Generate Section */}
          <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <AutoTransactionGenerator />
          </section>
        </div>
      </main>
    </div>
  );
};

export default TransactionGeneration;
