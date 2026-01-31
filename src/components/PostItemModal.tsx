import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Camera, MapPin, Calendar, Tag, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PostItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostItemData) => void;
}

export interface PostItemData {
  type: "lost" | "found";
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  time: string;
  image: File | null;
}

const categories = [
  "Wallet",
  "Phone",
  "ID Card",
  "Bag",
  "Keys",
  "Electronics",
  "Books",
  "Clothing",
  "Accessories",
  "Other",
];

export function PostItemModal({ isOpen, onClose, onSubmit }: PostItemModalProps) {
  const [type, setType] = useState<"lost" | "found">("lost");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await onSubmit({
      type,
      title,
      category,
      description,
      location,
      date,
      time,
      image,
    });

    setIsSubmitting(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setType("lost");
    setTitle("");
    setCategory("");
    setDescription("");
    setLocation("");
    setDate("");
    setTime("");
    setImage(null);
    setImagePreview(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-t-2xl sm:rounded-2xl shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-foreground">Post an Item</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-5">
              {/* Type Toggle */}
              <div className="flex gap-2 p-1 bg-secondary rounded-xl">
                <button
                  type="button"
                  onClick={() => setType("lost")}
                  className={cn(
                    "flex-1 py-3 rounded-lg font-semibold transition-all",
                    type === "lost"
                      ? "bg-lost text-lost-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  I Lost Something
                </button>
                <button
                  type="button"
                  onClick={() => setType("found")}
                  className={cn(
                    "flex-1 py-3 rounded-lg font-semibold transition-all",
                    type === "found"
                      ? "bg-found text-found-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  I Found Something
                </button>
              </div>

              {/* Image Upload */}
              <div>
                <Label className="text-sm font-medium text-foreground">Item Photo</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-3 aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent hover:bg-secondary/50 transition-colors">
                      <div className="p-3 rounded-full bg-secondary">
                        <Camera className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Click to upload a photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Item Name */}
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-foreground">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Item Name
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Blue Samsung Phone"
                  className="mt-2"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <Label className="text-sm font-medium text-foreground">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-sm font-medium text-foreground">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  {type === "lost" ? "Last Seen Location" : "Found Location"}
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Library, Block A"
                  className="mt-2"
                  required
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-sm font-medium text-foreground">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-sm font-medium text-foreground">
                    Time (approx)
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-foreground">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any additional details that might help identify the item..."
                  className="mt-2 min-h-[100px]"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className={cn(
                  "w-full py-6 text-base font-semibold",
                  type === "lost"
                    ? "bg-lost hover:bg-lost/90 text-lost-foreground"
                    : "bg-found hover:bg-found/90 text-found-foreground"
                )}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Posting..." : `Post ${type === "lost" ? "Lost" : "Found"} Item`}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
