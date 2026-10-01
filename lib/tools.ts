export type CategorySlug =
  | "pdf-tools"
  | "image-tools"
  | "student-tools"
  | "utility-tools";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  /** Short label for chips and mobile nav. */
  shortName: string;
  icon: string;
}

export interface Tool {
  /** URL segment: /tools/[slug] */
  slug: string;
  name: string;
  /** Short description used on cards and as the meta description. */
  description: string;
  category: CategorySlug;
  /** Icon name resolved by components/Icon.tsx */
  icon: string;
  /** Search keywords (not shown in the UI). */
  keywords: string[];
}

export const categories: Category[] = [
  {
    slug: "pdf-tools",
    name: "PDF Tools",
    shortName: "PDF",
    icon: "fileText",
    description:
      "Merge, split, convert, and stamp PDF files on this page. Nothing is uploaded, and no account is needed.",
  },
  {
    slug: "image-tools",
    name: "Image Tools",
    shortName: "Images",
    icon: "imageToPdf",
    description:
      "Compress, crop, convert, and strip location from photos. Your pictures never leave your device.",
  },
  {
    slug: "student-tools",
    name: "Student Tools",
    shortName: "Student",
    icon: "graduation",
    description:
      "Quick calculators for school and everyday life: GPA, percentages, age, and unit conversions.",
  },
  {
    slug: "utility-tools",
    name: "Everyday Tools",
    shortName: "Everyday",
    icon: "key",
    description: "Make a QR code, a strong password, or test your typing speed in your browser. Nothing is stored..",
  },
];

export const tools: Tool[] = [
  {
    slug: "merge-pdf",
    name: "Merge PDFs",
    description: "Combine several PDF files into one document. Drag, drop, reorder, and download.",
    category: "pdf-tools",
    icon: "merge",
    keywords: ["merge pdf", "combine pdf", "join pdf", "pdf joiner", "concatenate pdf"],
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    description: "Pull out the pages you need and save them as a new PDF. No upload.",
    category: "pdf-tools",
    icon: "scissors",
    keywords: ["split pdf", "extract pdf pages", "pdf splitter", "separate pdf pages"],
  },
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    description: "Make a PDF smaller, or set a size you need (for example under 1 MB).",
    category: "pdf-tools",
    icon: "shrink",
    keywords: ["compress pdf", "reduce pdf size", "pdf compressor", "shrink pdf"],
  },
  {
    slug: "images-to-pdf",
    name: "Images to PDF",
    description: "Turn photos or scans into a single PDF. Reorder pages and pick the page size.",
    category: "pdf-tools",
    icon: "imageToPdf",
    keywords: ["jpg to pdf", "png to pdf", "image to pdf", "photos to pdf", "picture to pdf"],
  },
  {
    slug: "word-to-pdf",
    name: "File to PDF",
    description: "Turn Word, PowerPoint, HTML, text, or an image into a PDF. Nothing is uploaded.",
    category: "pdf-tools",
    icon: "fileText",
    keywords: [
      "file to pdf",
      "word to pdf",
      "docx to pdf",
      "pptx to pdf",
      "html to pdf",
      "image to pdf",
      "txt to pdf",
      "convert to pdf",
    ],
  },
  {
    slug: "pdf-to-word",
    name: "PDF to Word",
    description: "Turn a PDF into an editable Word document. Text is copied on your device.",
    category: "pdf-tools",
    icon: "fileOutput",
    keywords: ["pdf to word", "pdf to docx", "convert pdf", "pdf converter", "editable pdf"],
  },
  {
    slug: "delete-pdf-pages",
    name: "Delete PDF Pages",
    description: "Tap pages or type numbers such as 10, 12. Download a PDF with only the pages you keep.",
    category: "pdf-tools",
    icon: "trash",
    keywords: ["delete pdf pages", "remove pdf pages", "drop pages from pdf", "pdf page deleter"],
  },
  {
    slug: "resize-pdf-pages",
    name: "Resize PDF Pages",
    description: "Make every page A4, Letter, or another size. Content is scaled to fit.",
    category: "pdf-tools",
    icon: "expand",
    keywords: ["resize pdf", "pdf page size", "a4 pdf", "letter size pdf", "change pdf paper size"],
  },
  {
    slug: "stamp-pdf",
    name: "Sign & Watermark PDF",
    description: "Draw a signature or watermark, then drag it where you want it on the page.",
    category: "pdf-tools",
    icon: "pen",
    keywords: [
      "sign pdf",
      "pdf signature",
      "watermark pdf",
      "stamp pdf",
      "e-sign",
      "confidential watermark",
    ],
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    description: "Make a photo a size you type, like 20kb. See the size before and after.",
    category: "image-tools",
    icon: "compressImage",
    keywords: ["compress image", "image compressor", "reduce image size", "optimize photo"],
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    description: "Change a photo's width and height in pixels or by percentage.",
    category: "image-tools",
    icon: "resize",
    keywords: ["resize image", "image resizer", "scale image", "change image dimensions"],
  },
  {
    slug: "image-converter",
    name: "Image Format Converter",
    description: "Convert photos between PNG, JPG, and WebP. Nothing is uploaded.",
    category: "image-tools",
    icon: "convert",
    keywords: ["png to jpg", "jpg to webp", "webp to png", "convert image format", "image converter"],
  },
  {
    slug: "image-cropper",
    name: "Crop Image",
    description: "Cut a photo to the part you need. Square, widescreen, or freehand.",
    category: "image-tools",
    icon: "crop",
    keywords: ["crop image", "crop photo", "cut image", "square crop", "profile picture crop"],
  },
  {
    slug: "remove-photo-location",
    name: "Remove Photo Location",
    description:
      "Strip hidden location and camera data from a photo before you share it. Nothing is uploaded.",
    category: "image-tools",
    icon: "mapPin",
    keywords: [
      "remove exif",
      "strip gps",
      "remove photo location",
      "exif remover",
      "privacy photo",
      "strip metadata",
    ],
  },
  {
    slug: "gpa-calculator",
    name: "GPA Calculator",
    description: "Work out your GPA on the 4.0 scale. Add courses, credits, and grades.",
    category: "student-tools",
    icon: "graduation",
    keywords: ["gpa calculator", "grade point average", "4.0 scale", "college gpa", "semester gpa"],
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    description: "Find a percentage, a test score, or how much something went up or down.",
    category: "student-tools",
    icon: "percent",
    keywords: ["percentage calculator", "percent of", "percentage change", "percent increase"],
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    description: "See exact age in years, months, days, hours, minutes, and seconds.",
    category: "student-tools",
    icon: "calendar",
    keywords: ["age calculator", "how old am i", "date of birth", "birthday countdown", "age in days"],
  },
  {
    slug: "unit-converter",
    name: "Unit Converter",
    description: "Convert length, weight, temperature, and file size. Metric and imperial together.",
    category: "student-tools",
    icon: "ruler",
    keywords: [
      "unit converter",
      "cm to inches",
      "kg to lbs",
      "celsius to fahrenheit",
      "mb to gb",
      "metric converter",
    ],
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    description: "Make a QR code for a link, text, or a small picture. Choose size and colors, then save a PNG.",
    category: "utility-tools",
    icon: "qrCode",
    keywords: ["qr code generator", "make qr code", "qr code for link", "free qr code", "qr png"],
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    description: "Create a strong random password. It is made on your device and never stored.",
    category: "utility-tools",
    icon: "key",
    keywords: ["password generator", "strong password", "random password", "secure password maker"],
  },
{
    slug: "typing-speed-test",
    name: "Typing Speed Test",
    description:
      "Check your WPM and accuracy with timed tests. Runs in your browser; nothing is stored.",
    category: "utility-tools",
    icon: "keyboard",
    keywords: [
      "typing speed test",
      "wpm test",
      "words per minute",
      "typing test",
      "keyboard speed",
      "typing accuracy",
    ],
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: CategorySlug): Tool[] {
  return tools.filter((t) => t.category === category);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
