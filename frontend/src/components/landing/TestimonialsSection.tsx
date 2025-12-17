import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import reviewService, { type Review } from "@/services/reviewService";
import { useAuth } from "@/contexts/AuthContext";

const defaultTestimonials = [
  {
    _id: "1",
    name: "Priya Sharma",
    role: "Computer Science Student",
    image: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=150&h=150&fit=crop&crop=face",
    content: "This platform has completely transformed how I manage my coursework. The unified dashboard saves me hours every week, and the grade analytics helped me identify areas to improve.",
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    name: "Dr. Rajesh Kumar",
    role: "Professor of Physics",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    content: "As an educator, I've tried many platforms. This one stands out for its intuitive interface and powerful features. Assignment management and grading have never been easier.",
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "3",
    name: "Ananya Iyer",
    role: "Graduate Student",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    content: "The collaboration features are incredible. Being able to connect with classmates and professors in one place has made group projects so much more manageable.",
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "4",
    name: "Arjun Patel",
    role: "Department Administrator",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    content: "Managing multiple courses and tracking student attendance used to be a nightmare. Now everything is streamlined and I can focus on what matters most - supporting our students.",
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "5",
    name: "Kavya Reddy",
    role: "Pre-Med Student",
    image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face",
    content: "The mobile experience is fantastic. I can check my grades, submit assignments, and stay on top of deadlines even when I'm between classes or in the library.",
    rating: 5,
    createdAt: new Date().toISOString(),
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Review[]>(defaultTestimonials);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    content: "",
    rating: 5,
    role: "",
  });

  const itemsPerPage = 3;
  // Create infinite scroll by duplicating testimonials
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];
  const maxIndex = testimonials.length;

  // Fetch published reviews on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviews = await reviewService.getPublishedReviews();
        if (reviews && reviews.length > 0) {
          setTestimonials(reviews);
        }
      } catch (error) {
        // If fetch fails, keep default testimonials
        console.error('Failed to fetch reviews:', error);
      }
    };

    fetchReviews();
  }, []);

  // Auto-scroll effect with smooth infinite loop
  useEffect(() => {
    if (!isAutoScrolling || testimonials.length <= itemsPerPage) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        // Reset to start seamlessly when reaching duplicate section
        if (next >= maxIndex) {
          setTimeout(() => setCurrentIndex(0), 50);
          return maxIndex - 1;
        }
        return next;
      });
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoScrolling, maxIndex, testimonials.length]);

  const next = () => {
    setIsAutoScrolling(false);
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= maxIndex) return 0;
      return nextIndex;
    });
  };
  
  const prev = () => {
    setIsAutoScrolling(false);
    setCurrentIndex((prev) => {
      const prevIndex = prev - 1;
      if (prevIndex < 0) return maxIndex - 1;
      return prevIndex;
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a review.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.content || !formData.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewService.createReview(formData);
      
      toast({
        title: "Review Submitted!",
        description: "Thank you! Your review will be published after admin approval.",
      });
      
      setFormData({ content: "", rating: 5, role: "" });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Loved by{" "}
            <span className="gradient-text">Students & Educators</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our community has to say about their experience.
          </p>
          
          {/* Add Review Button */}
          <div className="mt-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Your Review
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Share Your Experience</DialogTitle>
                  <DialogDescription>
                    Tell us about your experience with UniEd. Your review will be published after approval.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitReview} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Your Role *</Label>
                    <Input
                      id="role"
                      placeholder="e.g., Computer Science Student, Professor, etc."
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating *</Label>
                    <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= formData.rating
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Your Review * (10-500 characters)</Label>
                    <Textarea
                      id="content"
                      placeholder="Share your thoughts about UniEd..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      minLength={10}
                      maxLength={500}
                      rows={5}
                      required
                      className="resize-none"
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {formData.content.length}/500
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Navigation buttons */}
        <div className="flex justify-center gap-2 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={prev}
            className="glass"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={next}
            className="glass"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Testimonials carousel */}
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{ x: `-${currentIndex * (100 / itemsPerPage + 2)}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseEnter={() => setIsAutoScrolling(false)}
            onMouseLeave={() => setIsAutoScrolling(true)}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <motion.div
                key={`${testimonial._id}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <div className="glass rounded-2xl p-6 h-full transition-all duration-300 hover:bg-card/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                      >
                        <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random`}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(testimonials.length)].map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                setIsAutoScrolling(false);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentIndex % testimonials.length
                  ? "w-8 bg-gradient-to-r from-primary to-accent" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
