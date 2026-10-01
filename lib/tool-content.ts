export interface ToolContent {
  /** Short intro paragraph rendered under the H1. */
  tagline: string;
  /** Longer SEO paragraph rendered in the content section. */
  intro: string;
  howTo: string[];
  faqs: { question: string; answer: string }[];
}

export const toolContent: Record<string, ToolContent> = {
  "merge-pdf": {
    tagline:
      "Combine two or more PDF files into a single document, in the order you choose.",
    intro:
      "This free PDF merger combines multiple PDF files into one document without sending anything to a server. The merging happens right in your browser, which means it works offline once the page has loaded and your documents stay completely private. There is no file limit, no watermark, and no sign-up. Drop in contracts, scans, invoices, or book chapters and download a single merged PDF in seconds.",
    howTo: [
      "Drag and drop your PDF files onto the drop zone, or click it to browse. You can add more files at any time.",
      "Reorder the files with the up and down arrows until they match the order you want in the merged document.",
      "Click \"Merge PDFs\" and wait a moment while the files are combined in your browser.",
      "Click \"Download merged PDF\" to save the result to your device.",
    ],
    faqs: [
      {
        question: "Are my PDF files uploaded to a server?",
        answer:
          "No. The entire merge runs locally in your browser using the pdf-lib library. Your files never leave your device, so this tool is safe for contracts, medical records, and other sensitive documents.",
      },
      {
        question: "Is there a limit on the number or size of files?",
        answer:
          "No hard limit. Because everything runs on your own device, very large files (we warn above 50 MB) are only constrained by your browser's available memory.",
      },
      {
        question: "Will the merged PDF keep its original quality?",
        answer:
          "Yes. Pages are copied directly from the source documents without re-rendering or recompression, so text, images, and vector graphics stay exactly as they were.",
      },
      {
        question: "Can I merge password-protected PDFs?",
        answer:
          "Not directly. Encrypted PDFs cannot be read by the browser without the password. Remove the password first, then merge the unlocked files.",
      },
    ],
  },
  "split-pdf": {
    tagline:
      "Extract specific pages or page ranges from a PDF into new documents.",
    intro:
      "Split a PDF into smaller documents without installing software or uploading files anywhere. Type page ranges such as \"1-3, 5, 8-10\" and this tool extracts exactly those pages, entirely inside your browser. You can pull all selected pages into one new PDF, or export every range as its own file and download them together as a ZIP archive. It works well for pulling a chapter out of a long report, separating scanned pages, or sharing only part of a document.",
    howTo: [
      "Drop a PDF onto the drop zone or click to select one. The tool shows the total page count once it loads.",
      "Enter the pages you want, using commas and dashes. For example: \"1-3, 5, 8-10\".",
      "Choose whether to extract everything into a single PDF or save each range as a separate file (delivered as a ZIP).",
      "Click \"Split PDF\" and download the result.",
    ],
    faqs: [
      {
        question: "Does splitting reduce the quality of my PDF?",
        answer:
          "No. Pages are copied from the original file without re-rendering, so fonts, images, and layout are untouched.",
      },
      {
        question: "Can I split one PDF into many files at once?",
        answer:
          "Yes. Enter several ranges separated by commas and pick \"one file per range\". You will get a ZIP containing a separate PDF for every range.",
      },
      {
        question: "Is this tool really private?",
        answer:
          "Yes. The PDF is parsed and rebuilt by JavaScript running on your own device. Nothing is transmitted over the network.",
      },
      {
        question: "What happens if I enter an invalid page number?",
        answer:
          "The tool checks your input against the document's page count and shows a clear error message instead of producing a broken file.",
      },
    ],
  },
  "compress-pdf": {
    tagline:
      "Make a PDF smaller, or set a size you need — for example under 1 MB.",
    intro:
      "Shrink a PDF on this device. Leave the size box empty to re-pack the file without changing how it looks. If you type a target such as 1 MB, the tool first tries a lossless shrink. If that is still too big, it redraws pages as pictures at a lower quality until it gets close to your target. If the target is so small that the pages would become unreadable, you get a clear message instead of a ruined file.",
    howTo: [
      "Drop a PDF onto the box.",
      "Optionally type a size in MB, such as 1. Leave it blank if you only want a gentle shrink.",
      "Click \"Compress PDF\". Check the before and after sizes.",
      "Download the result if you are happy with it.",
    ],
    faqs: [
      {
        question: "Why did I get a message that the target is too small?",
        answer:
          "A PDF cannot shrink forever. If even a very compressed picture of each page is still larger than your target, the tool stops and tells you the smallest safe size.",
      },
      {
        question: "Will text stay sharp?",
        answer:
          "If no target is set, or the lossless pass already fits, yes. Hitting a tight size may redraw pages as pictures, so text can look a little softer. The tool warns you when that happens.",
      },
      {
        question: "Is my document uploaded anywhere?",
        answer: "No. Compression runs in your browser.",
      },
      {
        question: "What does removing hidden document info do?",
        answer:
          "It clears title, author, and similar fields. That is a small size win and also drops personal details you may not want to share.",
      },
    ],
  },
  "images-to-pdf": {
    tagline:
      "Turn JPG and PNG images into a single PDF, one image per page, in your order.",
    intro:
      "Convert photos, scans, and screenshots into a single PDF document without uploading them anywhere. Add JPG or PNG files, arrange them in any order, and choose between A4 pages (with sensible margins) or pages sized exactly to each image. The PDF is assembled locally with the pdf-lib library, so a 100-photo album converts just as privately as a single receipt. People use it to submit homework scans, compile receipts for expense reports, or send a set of photos as one file.",
    howTo: [
      "Drag and drop JPG or PNG images onto the drop zone. You can add more at any time.",
      "Reorder the images with the arrow buttons. Each image becomes one page in the final PDF.",
      "Choose a page size: A4 (image centered with margins) or \"fit to image\" (each page matches its image exactly).",
      "Click \"Create PDF\", then download your document.",
    ],
    faqs: [
      {
        question: "Which image formats are supported?",
        answer:
          "JPG and PNG are supported natively. For WebP or other formats, run them through our free Image Format Converter first, then create the PDF.",
      },
      {
        question: "Are my photos uploaded to a server?",
        answer:
          "No. The PDF is generated on your device. Nothing is sent over the network, so private photos stay private.",
      },
      {
        question: "Will my images be compressed?",
        answer:
          "No. Images are embedded at their original resolution and quality. If you want a smaller PDF, compress the images first with the Image Compressor tool.",
      },
      {
        question: "Can I mix portrait and landscape images?",
        answer:
          "Yes. In \"fit to image\" mode every page adopts its image's orientation. In A4 mode images are scaled to fit the page while keeping their aspect ratio.",
      },
    ],
  },
  "word-to-pdf": {
    tagline: "Turn Word, PowerPoint, HTML, text, or an image into a PDF on this device.",
    intro:
      "Drop a file and get a PDF back. Word documents (.docx), PowerPoint (.pptx), web pages (HTML), plain text, and common images all work. The conversion happens in your browser, so the file never goes to a server. Layouts may be simplified — the goal is a readable PDF you can send, not a pixel-perfect copy of a complex slide.",
    howTo: [
      "Drop a Word, PowerPoint, HTML, text, or image file onto the box.",
      "Click \"Convert to PDF\".",
      "Download the PDF.",
    ],
    faqs: [
      {
        question: "Is my file uploaded?",
        answer: "No. Conversion runs in your browser.",
      },
      {
        question: "Does it support old .doc files?",
        answer:
          "No, only .docx. Open the old file in Word or Google Docs and save it as .docx first.",
      },
      {
        question: "What about PowerPoint?",
        answer:
          "The words on each slide are copied into the PDF. Fancy layouts and some pictures may not carry over.",
      },
      {
        question: "Which images work?",
        answer: "JPG, PNG, WebP, and GIF. Each image becomes a page.",
      },
    ],
  },
  "image-compressor": {
    tagline:
      "Type a size like 20kb and compress a photo to that target with as little quality loss as possible.",
    intro:
      "Compress JPG, PNG, and WebP images right in your browser. No uploads, no queues, no accounts. Enter the size you need — 20kb, 500kb, or 1mb — and the tool aims for that file size while keeping as much quality as it can. You see the original size, the compressed size, and the percentage saved before you download anything. If the target is too small to keep a readable picture, you get a clear message instead of a ruined file. Compression runs on your device, so even large phone photos stay private.",
    howTo: [
      "Drop an image (JPG, PNG, or WebP) onto the drop zone, or click to browse.",
      "Type a target size such as 20kb, 500kb, or 1mb. You can also cap the longest edge if you want.",
      "Click \"Compress image\" and compare the before/after sizes shown on screen.",
      "Download the compressed image, or try a different size.",
    ],
    faqs: [
      {
        question: "Does compressing happen on my device?",
        answer:
          "Yes. The image is compressed by JavaScript running in your browser using a web worker. It is never uploaded, which also makes the tool very fast.",
      },
      {
        question: "How do I type the size?",
        answer:
          "Use 20kb, 500kb, or 1mb. A number with no unit is treated as kilobytes. The tool keeps quality as high as it can while aiming for that size.",
      },
      {
        question: "Why did my PNG become a JPG?",
        answer:
          "PNG often cannot shrink to a small target. The tool may save a JPG so it can hit the size you asked for without turning the picture into mush.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "No hard limit. We simply show a warning above 50 MB because very large files can be slow to process on low-memory devices.",
      },
    ],
  },
  "image-resizer": {
    tagline:
      "Resize any image by exact pixel dimensions or by percentage, with an aspect ratio lock.",
    intro:
      "Resize images to exact dimensions without installing an editor or uploading your pictures to someone else's server. Enter a width and height in pixels, or scale by percentage, and toggle the aspect ratio lock to prevent stretching. The resized image is rendered on a high-quality canvas on your own device and downloads in the same format you supplied. Use it to hit avatar size requirements, prepare images for a blog, shrink camera photos for email, or create thumbnails.",
    howTo: [
      "Drop an image onto the drop zone or click to select one. The current dimensions appear automatically.",
      "Pick a mode: \"Pixels\" for exact dimensions or \"Percentage\" to scale relative to the original.",
      "Enter your target size. With the aspect ratio lock on, changing one dimension updates the other automatically.",
      "Click \"Resize image\", check the preview, and download the result.",
    ],
    faqs: [
      {
        question: "Will resizing distort my image?",
        answer:
          "Not if the aspect ratio lock is on. The tool keeps the original proportions. Turn the lock off only when you deliberately want to stretch the image to exact dimensions.",
      },
      {
        question: "Can I enlarge an image?",
        answer:
          "Yes, you can scale above 100%. Keep in mind that enlarging cannot invent detail that was never captured, so expect some softness on big upscales.",
      },
      {
        question: "Does the tool keep my image format?",
        answer:
          "Yes. A PNG stays a PNG and a JPG stays a JPG, so transparency and compression behavior are preserved.",
      },
      {
        question: "Is my photo uploaded anywhere?",
        answer:
          "No. Resizing happens on an HTML canvas inside your browser. The image never leaves your device.",
      },
    ],
  },
  "image-converter": {
    tagline:
      "Convert images between PNG, JPG, and WebP locally, with an optional quality setting.",
    intro:
      "Switch an image from one format to another in seconds, entirely inside your browser. Convert WebP files that some apps refuse to open into universal JPG or PNG, turn heavy PNG screenshots into compact WebP for the web, or produce JPGs for forms that only accept them. When converting to JPG, which does not support transparency, transparent areas are filled with white automatically. A quality slider is available for JPG and WebP output so you control the balance between size and fidelity.",
    howTo: [
      "Drop an image onto the drop zone. PNG, JPG, and WebP are all accepted as input.",
      "Choose the output format: PNG, JPG, or WebP.",
      "For JPG and WebP, adjust the quality slider if you want a smaller or higher-fidelity file.",
      "Click \"Convert\", then download the converted image.",
    ],
    faqs: [
      {
        question: "What happens to transparency when I convert to JPG?",
        answer:
          "Transparent pixels are placed on a white background, because JPG has no alpha channel. Convert to PNG or WebP instead if you need to keep transparency.",
      },
      {
        question: "Which format should I choose?",
        answer:
          "WebP gives the smallest files for the web. JPG is the safest choice for compatibility with older software. PNG is best for screenshots, logos, and anything that needs transparency or pixel-perfect sharpness.",
      },
      {
        question: "Is the conversion lossless?",
        answer:
          "Converting to PNG is lossless. Converting to JPG or WebP applies lossy compression controlled by the quality slider. 90% is a good default.",
      },
      {
        question: "Are my images sent to a server?",
        answer:
          "No. The conversion uses the canvas API built into your browser. Your images never leave your device.",
      },
    ],
  },
  "gpa-calculator": {
    tagline:
      "Calculate your GPA on the 4.0 scale. Add courses, credits, and grades, and see results live.",
    intro:
      "Work out your grade point average on the standard 4.0 scale used by most US colleges and high schools. Add a row for each course, enter its credit hours, and pick the letter grade. The GPA updates instantly as you type. The calculator weights every grade by its credits, so a 4-credit course influences your GPA more than a 1-credit seminar, exactly as your registrar computes it. Nothing is stored or sent anywhere, so your grades stay on your screen and vanish when you leave the page.",
    howTo: [
      "Enter each course's name (optional), its credit hours, and the letter grade you earned.",
      "Click \"Add course\" for more rows, or the remove button to delete one.",
      "Your GPA, total credits, and total grade points update live at the top of the calculator.",
      "Use plus and minus grades (A-, B+, and so on) if your school awards them.",
    ],
    faqs: [
      {
        question: "How is GPA calculated?",
        answer:
          "Each letter grade maps to points (A = 4.0, A- = 3.7, B+ = 3.3, and so on). Multiply each course's points by its credits, add those products up, and divide by the total credits.",
      },
      {
        question: "What about A+ grades?",
        answer:
          "This calculator counts an A+ as 4.0, the same as an A, which is the most common convention. Some institutions award 4.3 for an A+, so check your school's policy.",
      },
      {
        question: "Can I calculate a cumulative GPA across semesters?",
        answer:
          "Yes. Enter every course from all semesters in one list. Since the math weights by credits, the result is your cumulative GPA.",
      },
      {
        question: "Are pass/fail courses included?",
        answer:
          "Usually not. Pass/fail courses typically earn credits without grade points, so leave them out of the calculation, as most registrars do.",
      },
    ],
  },
  "percentage-calculator": {
    tagline:
      "Three percentage calculators in one: X% of Y, X is what % of Y, and percentage change.",
    intro:
      "Solve the three most common percentage problems without wrestling with formulas. The first mode answers \"what is X% of Y\", which covers tips, discounts, and tax. The second answers \"X is what percent of Y\", which covers test scores and progress toward a goal. The third computes the percentage change between two values and correctly tells increases from decreases, which is what you need for price changes, weight loss, and growth figures. Every result updates instantly as you type and shows the formula used, so the tool doubles as a homework checker.",
    howTo: [
      "Pick the mode that matches your question using the three tabs.",
      "Enter your two numbers. The result appears instantly, no button needed.",
      "Read the formula shown beneath the result to understand or double-check the math.",
      "Switch tabs at any time. Each mode keeps its own inputs.",
    ],
    faqs: [
      {
        question: "How do I calculate a percentage of a number?",
        answer:
          "Multiply the number by the percentage and divide by 100. For example, 15% of 80 is 80 x 15 / 100 = 12.",
      },
      {
        question: "How do I work out what percent one number is of another?",
        answer:
          "Divide the part by the whole and multiply by 100. For example, 45 out of 60 is 45 / 60 x 100 = 75%.",
      },
      {
        question: "How is percentage change calculated?",
        answer:
          "Subtract the old value from the new value, divide by the old value, then multiply by 100. Going from 50 to 65 is (65 - 50) / 50 x 100 = a 30% increase.",
      },
      {
        question: "Is percentage change the same as percentage points?",
        answer:
          "No. Moving from 10% to 15% is a rise of 5 percentage points, but a 50% relative increase. This calculator reports the relative change between the two values you enter.",
      },
    ],
  },
  "age-calculator": {
    tagline:
      "Find an exact age in years, months, days, hours, minutes, and seconds, plus a countdown to the next birthday.",
    intro:
      "Enter a date of birth and get an exact age broken down into years, months, and days, plus hours, minutes, and seconds lived, along with the total in days and weeks and how long until the next birthday. When you leave \"as of\" on today, the clock ticks every second. You can also change the \"as of\" date to work out an age on any day in the past or future, which is handy for forms that ask for your age on a specific date, for school enrollment cutoffs, or for checking eligibility rules. The math runs instantly in your browser and handles leap years correctly. Nothing you enter is stored or sent anywhere.",
    howTo: [
      "Pick the date of birth using the first date field.",
      "Leave the \"as of\" date on today, or change it to calculate the age on another day.",
      "Read the exact age in years, months, and days, plus hours, minutes, and seconds lived, and the next birthday countdown.",
      "Change either date at any time. The results update instantly, and today's view ticks every second.",
    ],
    faqs: [
      {
        question: "How is the age calculated?",
        answer:
          "The calculator counts full years first, then full months, then the remaining days, the same way ages are stated on official forms. Leap years and month lengths are handled correctly.",
      },
      {
        question: "Can I calculate an age on a date other than today?",
        answer:
          "Yes. Set the \"as of\" date to any day you like, past or future, and the age is computed for that day.",
      },
      {
        question: "What does the next birthday countdown show?",
        answer:
          "It shows how many days remain until the person's next birthday and which weekday it falls on.",
      },
      {
        question: "Is my date of birth stored?",
        answer:
          "No. The calculation happens in your browser's memory and everything disappears when you close the page.",
      },
    ],
  },
  "qr-code-generator": {
    tagline:
      "Create a QR code for any link, text, or a small picture, then download a PNG.",
    intro:
      "Generate a QR code in seconds for a website link, Wi-Fi password, phone number, any text, or a small picture. The code updates live as you type, so you can see exactly what you will download. A QR can only hold a tiny picture, not a full camera photo — the tool shrinks the image as far as a scan can carry. Choose the image size, pick foreground and background colors that match your brand, and select an error correction level if the code will be printed somewhere it might get scratched or partly covered. The PNG downloads straight from your browser. What you encode is never sent to a server.",
    howTo: [
      "Pick Link or text, or Picture.",
      "Type a link, or drop a picture. The QR code appears immediately.",
      "Pick a size. 512 px works well for print and screens. Optionally change the colors.",
      "Click \"Download PNG\" and use the image anywhere.",
    ],
    faqs: [
      {
        question: "Do these QR codes expire?",
        answer:
          "No. The QR code contains your text directly rather than a redirect link, so it works forever and does not depend on this site staying online.",
      },
      {
        question: "What is error correction?",
        answer:
          "QR codes store redundant data so they still scan when partly damaged. Higher levels (Q and H) survive more damage but make the code denser. Medium (M) is right for most uses.",
      },
      {
        question: "Can I use custom colors?",
        answer:
          "Yes, but keep strong contrast between the foreground and background, with the foreground darker. Low-contrast or inverted codes fail to scan on many phones.",
      },
      {
        question: "Can I make a QR from a picture?",
        answer:
          "Yes. Choose Picture and drop an image. A QR can only hold a tiny copy, not a full camera photo, so the tool shrinks it as far as a scan can carry. For sharing a real photo, a link still works better.",
      },
      {
        question: "Is what I encode kept private?",
        answer:
          "Yes. The QR code is drawn on a canvas in your browser. The text never leaves your device, unlike QR services that route scans through their own servers.",
      },
    ],
  },
  "password-generator": {
    tagline:
      "Generate strong random passwords locally, using your browser's cryptographic randomness.",
    intro:
      "Create strong, random passwords with exactly the rules you need: set the length, then include or exclude uppercase letters, lowercase letters, numbers, and symbols. Passwords are generated with the Web Crypto API, the same cryptographically secure random source used by password managers, not the weaker Math.random. Generation happens entirely on your device. No password is ever transmitted, logged, or stored, and a strength meter shows the estimated entropy so you can see how much security each extra character buys. Use it for new accounts, Wi-Fi networks, or database credentials.",
    howTo: [
      "Set the password length with the slider. Twelve characters is a sensible minimum, sixteen is better.",
      "Tick the character types you want: uppercase, lowercase, numbers, symbols.",
      "Click \"Generate\" as many times as you like until you get one you are happy with.",
      "Click \"Copy\" and paste the password into your password manager.",
    ],
    faqs: [
      {
        question: "Is it safe to generate a password on a website?",
        answer:
          "On this one, yes. The password is created by the Web Crypto API in your browser and never sent anywhere. You can open the page, disconnect from the internet, and generate passwords offline.",
      },
      {
        question: "How long should a password be?",
        answer:
          "At least 12 characters for ordinary accounts and 16 or more for anything important. Length increases strength faster than adding symbol variety does.",
      },
      {
        question: "Are the passwords truly random?",
        answer:
          "Yes. Characters are drawn using crypto.getRandomValues with rejection sampling, which avoids the subtle bias that naive random pickers introduce.",
      },
      {
        question: "Does the site remember generated passwords?",
        answer:
          "No. Passwords exist only on your screen and in your clipboard after you copy them. Reloading the page destroys everything.",
      },
    ],
  },
  "typing-speed-test": {
    tagline:
      "Measure your words per minute and accuracy with timed passages that stay on your device.",
    intro:
      "Test how fast and accurately you type with short, medium, or long timed runs. Pick a difficulty from 1 (easy) to 5 (hard), start typing, and watch live WPM, raw speed, and accuracy update as you go. Characters light up green or red so you can see mistakes instantly. When the timer ends, you get a clear scorecard with errors, consistency tips, and a chance to try again with a fresh passage. Everything runs in your browser. Your keystrokes are never uploaded or saved.",
    howTo: [
      "Choose a time (15, 30, 60, or 120 seconds) and a difficulty from 1 (easy) to 5 (hard).",
      "Click the typing area and start typing the passage shown.",
      "Watch the live WPM and accuracy meters while you type.",
      "When time runs out, review your score and try again if you want.",
    ],
    faqs: [
      {
        question: "How is WPM calculated?",
        answer:
          "Words per minute uses the standard formula: correct characters divided by five, then divided by minutes elapsed. That matches how most typing tests and typing courses score speed.",
      },
      {
        question: "What is the difference between WPM and raw WPM?",
        answer:
          "WPM counts only correct characters. Raw WPM counts every character you typed, including mistakes, so you can see how much errors slow you down.",
      },
      {
        question: "Is my typing stored or sent anywhere?",
        answer:
          "No. The passage and your keystrokes stay in your browser's memory for this session only. Reloading the page clears the test. Nothing is uploaded or written to a server.",
      },
      {
        question: "What is a good typing speed?",
        answer:
          "Around 40 WPM is typical for everyday typing. 60–80 WPM is strong for most office work, and above 100 WPM is excellent. Accuracy above 95% usually matters more than a small speed bump.",
      },
    ],
  },
  "unit-converter": {
    tagline:
      "Convert length, weight, temperature, and data sizes. Metric and imperial, all in one place.",
    intro:
      "Switch between everyday units without hunting for a formula. Pick a category, type a number, and every other unit in that group updates at once. Length covers millimetres through miles, weight covers milligrams through pounds, temperature covers Celsius, Fahrenheit, and Kelvin, and data size covers bytes through terabytes. It is built for homework, cooking, travel, and file-size questions alike. The math runs in your browser, so nothing you type is stored or sent anywhere.",
    howTo: [
      "Choose a category: Length, Weight, Temperature, or Data size.",
      "Type a value in any unit field. The rest update immediately.",
      "Copy any converted value you need.",
      "Switch categories at any time. Each one keeps its last numbers.",
    ],
    faqs: [
      {
        question: "Which units are included?",
        answer:
          "Length (mm, cm, m, km, in, ft, yd, mi), weight (mg, g, kg, oz, lb), temperature (C, F, K), and data size (B, KB, MB, GB, TB using 1024-based binary units).",
      },
      {
        question: "Are data sizes binary or decimal?",
        answer:
          "Binary (1 KB = 1024 bytes), which matches how operating systems usually report file sizes.",
      },
      {
        question: "How accurate is the conversion?",
        answer:
          "Conversions use standard SI and imperial factors. Results show up to 6 meaningful decimal places and drop trailing zeros so they stay easy to read.",
      },
      {
        question: "Is anything I type stored?",
        answer:
          "No. The numbers live only in your browser until you close or reload the page.",
      },
    ],
  },
  "pdf-to-word": {
    tagline: "Turn a PDF into an editable Word file on this device. Nothing is uploaded.",
    intro:
      "This converter copies the text out of a PDF and saves it as a Word document (.docx) you can edit. The work happens in your browser, so contracts, school papers, and personal files never go to a server. Text, headings, and line breaks usually come through. Scanned pages (photos of paper) have no selectable text, so those pages are marked in the Word file instead of guessed at. Fancy magazine layouts will not look identical — the goal is an editable copy of the words.",
    howTo: [
      "Drop your PDF onto the box, or click it to choose a file.",
      "Click \"Convert to Word\" and wait a moment.",
      "Download the .docx file and open it in Word, Google Docs, or LibreOffice.",
    ],
    faqs: [
      {
        question: "Is my PDF uploaded?",
        answer:
          "No. The file is read in your browser and the Word document is built there. You can disconnect from the internet after the page loads.",
      },
      {
        question: "Will the Word file look exactly like the PDF?",
        answer:
          "Not always. Text is copied so you can edit it. Images, columns, and exact fonts may not match. For a picture-perfect copy, keep the PDF.",
      },
      {
        question: "What about scanned PDFs?",
        answer:
          "A scan is a photo of a page, so there is no text to copy. Those pages are noted in the Word file. Printed PDFs made from Word or a website work much better.",
      },
      {
        question: "Can it open a password-protected PDF?",
        answer:
          "No. Remove the password first, then convert the unlocked file.",
      },
    ],
  },
  "delete-pdf-pages": {
    tagline: "Tap pages or type numbers such as 10, 12. Keep the rest in a new PDF.",
    intro:
      "Need to drop a blank page, an extra scan, or a sheet you should not share? Select those pages and download a new PDF without them. Nothing is uploaded. The original file on your computer stays as it is until you choose to replace it.",
    howTo: [
      "Drop your PDF onto the box.",
      "Type the pages to remove, such as 10, 12, or tap them in the grid. Both stay in sync.",
      "Click \"Delete selected pages\".",
      "Download the new PDF.",
    ],
    faqs: [
      {
        question: "Does this change my original file?",
        answer:
          "No. It builds a new file in your browser. Your original stays on disk until you save over it yourself.",
      },
      {
        question: "Can I delete every page?",
        answer: "No. A PDF needs at least one page. Leave one unticked.",
      },
      {
        question: "Is this the same as Split PDF?",
        answer:
          "Split is for keeping a range such as pages 1–3. This tool is for pointing at the pages you do not want. Same privacy, different job.",
      },
      {
        question: "Are files uploaded?",
        answer: "No. Pages are removed on your device.",
      },
    ],
  },
  "resize-pdf-pages": {
    tagline: "Make every page A4, Letter, or another paper size. Content is scaled to fit.",
    intro:
      "Some printers, schools, and forms insist on a page size. This tool rebuilds your PDF so every page is A4, US Letter, Legal, or A5. The content is scaled and centered so nothing is stretched. It all runs in your browser.",
    howTo: [
      "Drop your PDF onto the box.",
      "Pick the paper size you need. Tick landscape if the page should be wide.",
      "Click \"Resize pages\".",
      "Download the new PDF.",
    ],
    faqs: [
      {
        question: "Is this the same as Compress PDF?",
        answer:
          "No. Compress tries to make the file weigh less. This tool changes the paper size of each page.",
      },
      {
        question: "Will pictures look blurry?",
        answer:
          "If you shrink a large page onto a smaller one, the picture is scaled down and should stay clear. Enlarging a small page can look softer.",
      },
      {
        question: "Is my PDF uploaded?",
        answer: "No. The new pages are drawn on your device.",
      },
      {
        question: "What is A4 vs Letter?",
        answer:
          "A4 is the usual size in most countries. Letter is the usual size in the United States. Pick the one your printer or school asked for.",
      },
    ],
  },
  "stamp-pdf": {
    tagline: "Draw a signature or stamp a watermark on a PDF. The file never leaves this page.",
    intro:
      "Sign a form without printing it, or mark a file as confidential before you send it. Choose Signature to draw with your finger or mouse, or to upload a picture of your signature. Choose Watermark to put words such as Confidential across the page. Both options run in your browser. Nobody else sees the file.",
    howTo: [
      "Drop your PDF onto the box.",
      "Pick Signature or Watermark.",
      "Pick Signature or Watermark, then drag the stamp to the right spot on the page preview.",
      "Click the button and download the stamped PDF.",
    ],
    faqs: [
      {
        question: "Is a drawn signature legally binding?",
        answer:
          "That depends on your country and the document. This tool places a picture of a signature on the file. It does not add a government digital certificate.",
      },
      {
        question: "Can other people copy my signature from the PDF?",
        answer:
          "Yes, just as they could from a paper scan. Only sign files you trust, and do not reuse a signature image carelessly.",
      },
      {
        question: "Is the PDF uploaded?",
        answer: "No. Signing and watermarking happen on your device.",
      },
      {
        question: "Will the watermark cover the text?",
        answer:
          "It sits on top with some see-through so the words underneath stay readable. You can change how solid it looks with the slider.",
      },
    ],
  },
  "image-cropper": {
    tagline: "Cut a photo to the part you need. Square, widescreen, or freehand.",
    intro:
      "Crop a picture for a profile photo, an ID form, or a slide. Drag the box, pick a shape such as square or wide, and download the result. The photo never leaves your device.",
    howTo: [
      "Drop a photo onto the box.",
      "Pick a shape, or leave it on Free and drag the corners.",
      "Move the box over the part you want to keep.",
      "Click \"Crop photo\" and download.",
    ],
    faqs: [
      {
        question: "Is my photo uploaded?",
        answer: "No. Cropping uses the canvas in your browser.",
      },
      {
        question: "Does crop reduce quality?",
        answer:
          "You keep the pixels inside the box. Saving as JPG uses a little compression. PNG stays lossless.",
      },
      {
        question: "Can I crop on a phone?",
        answer: "Yes. Drag the box with your finger. Corner handles are large enough to grab.",
      },
      {
        question: "What does Square mean?",
        answer: "The crop is as wide as it is tall — useful for profile pictures.",
      },
    ],
  },
  "remove-photo-location": {
    tagline: "Strip hidden location and camera data before you share a photo.",
    intro:
      "Many phones save a map location inside a photo. Anyone who gets the file can sometimes see where it was taken. This tool checks for that hidden data, then saves a clean copy without location, camera model, or other notes. The new picture is made on your device. The original file is not changed until you replace it.",
    howTo: [
      "Drop a photo onto the box.",
      "Read the two-line note about why location data matters, then the message about this file.",
      "Click \"Remove hidden data\".",
      "Download the clean photo and share that copy.",
    ],
    faqs: [
      {
        question: "What is this hidden data?",
        answer:
          "Cameras store extra notes called EXIF: GPS, the camera model, and the time the shot was taken. You usually cannot see them just by looking at the picture.",
      },
      {
        question: "Is my photo uploaded?",
        answer: "No. Checking and cleaning happen in your browser.",
      },
      {
        question: "Does this make the picture look different?",
        answer:
          "For JPG, PNG, and WebP, the picture itself stays the same. Only hidden notes are dropped. iPhone HEIC photos may need to be saved as JPG first, depending on your browser.",
      },
      {
        question: "Should I still share the original?",
        answer:
          "Share the clean download, not the original, if you do not want the location attached.",
      },
    ],
  },
};
