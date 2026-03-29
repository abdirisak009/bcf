import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  return (
    <section id="about" className="py-20 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-6">Who We Are</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Baraarug Consulting is a leading professional services firm dedicated to helping organizations navigate complex challenges and achieve sustainable growth.
            </p>
            <p className="text-muted-foreground mb-8">
              With our extensive experience and dedicated team of experts, we provide comprehensive solutions that drive growth and create lasting impact for our clients.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="bg-background">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-primary mb-2">Our Vision</h3>
                <p className="text-muted-foreground">
                  To be the premier consulting partner driving innovation and excellence in Africa.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-primary mb-2">Our Values</h3>
                <p className="text-muted-foreground">
                  Excellence, Integrity, Innovation, and Collaboration guide everything we do.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-primary mb-2">Our Mission</h3>
                <p className="text-muted-foreground">
                  Empowering organizations through innovative solutions and sustainable transformation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-16 bg-background rounded-lg p-8 border border-border">
          <h3 className="text-2xl font-bold text-foreground mb-4">Message from Leadership</h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            At Baraarug Consulting Firm, we believe that true success is achieved through collaboration and a deep understanding of our clients&apos; needs. We are committed to working hand-in-hand with our clients, providing tailored solutions and strategic insights that drive measurable results. Our interdisciplinary team brings expertise, innovation, and a relentless pursuit of excellence to every project.
          </p>
        </div>
      </div>
    </section>
  );
}
