
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Fees = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Fees Management</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Tuition Fees</CardTitle>
          <CardDescription>
            Track and manage fee payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This section will allow you to manage fee payments and send reminders.</p>
          <p className="mt-4 text-muted-foreground">
            Check back soon for fee management functionality!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Fees;
