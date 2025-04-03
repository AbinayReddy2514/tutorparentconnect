
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Attendance = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Attendance Tracking</CardTitle>
          <CardDescription>
            Monitor student attendance and participation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This section will allow you to track and manage student attendance.</p>
          <p className="mt-4 text-muted-foreground">
            Check back soon for attendance tracking functionality!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
