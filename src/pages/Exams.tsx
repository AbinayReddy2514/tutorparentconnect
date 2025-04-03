
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Exams = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Exams</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Exams Management</CardTitle>
          <CardDescription>
            Track upcoming exams and test results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This section will allow you to manage exams and test schedules.</p>
          <p className="mt-4 text-muted-foreground">
            Check back soon for exam tracking functionality!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Exams;
