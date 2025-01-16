// "use client"
// import React, { useState } from 'react';
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { FileJson, ArrowLeftRight, ArrowLeft, Clipboard } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { cn } from "@/lib/utils";

// const JsonCompare = () => {
//   const [leftJson, setLeftJson] = useState("");
//   const [rightJson, setRightJson] = useState("");
//   const [showResults, setShowResults] = useState(false);
//   const { toast } = useToast();
//   const [comparison, setComparison] = useState<{
//     left: DiffLine[];
//     right: DiffLine[];
//     matchDetails: string[];
//   } | null>(null);

//   interface DiffLine {
//     content: string;
//     indentation: string;
//     lineNumber: number;
//     status: 'identical' | 'similar' | 'different' | 'missing' | 'placeholder';
//     matchPercentage: number;
//   }

//   const calculateSimilarity = (str1: string, str2: string): number => {
//     if (!str1 && !str2) return 100;
//     if (!str1 || !str2) return 0;
    
//     let matches = 0;
//     const longer = str1.length > str2.length ? str1 : str2;
//     const shorter = str1.length > str2.length ? str2 : str1;
    
//     for (let i = 0; i < shorter.length; i++) {
//       if (shorter[i] === longer[i]) matches++;
//     }
    
//     return Math.round((matches / longer.length) * 100);
//   };

//   const getIndentation = (line: string): string => {
//     const match = line.match(/^(\s*)/);
//     return match ? match[1] : '';
//   };

//   const findBestMatch = (
//     line: string,
//     otherLines: string[],
//     currentIndex: number,
//     contextSize: number = 3
//   ): { index: number; similarity: number } | null => {
//     let bestMatch = { index: -1, similarity: 0 };
    
//     const startIdx = Math.max(0, currentIndex - contextSize);
//     const endIdx = Math.min(otherLines.length - 1, currentIndex + contextSize);
    
//     for (let i = startIdx; i <= endIdx; i++) {
//       const similarity = calculateSimilarity(line.trim(), otherLines[i].trim());
//       if (similarity > bestMatch.similarity) {
//         bestMatch = { index: i, similarity: similarity };
//       }
//     }
    
//     return bestMatch.similarity > 60 ? bestMatch : null;
//   };

//   const compareJson = () => {
//     try {
//       const leftObj = JSON.parse(leftJson);
//       const rightObj = JSON.parse(rightJson);

//       const leftLines = JSON.stringify(leftObj, null, 2).split("\n");
//       const rightLines = JSON.stringify(rightObj, null, 2).split("\n");
      
//       const leftResult: DiffLine[] = [];
//       const rightResult: DiffLine[] = [];
//       const matchDetails: string[] = [];

//       let leftIdx = 0;
//       let rightIdx = 0;

//       const processedLeft = new Set<number>();
//       const processedRight = new Set<number>();

//       while (leftIdx < leftLines.length || rightIdx < rightLines.length) {
//         const leftLine = leftLines[leftIdx];
//         const rightLine = rightLines[rightIdx];

//         if (!leftLine && !rightLine) break;

//         if (leftLine && rightLine) {
//           const similarity = calculateSimilarity(leftLine.trim(), rightLine.trim());
          
//           if (similarity >= 60) {
//             leftResult.push({
//               content: leftLine,
//               indentation: getIndentation(leftLine),
//               lineNumber: leftIdx + 1,
//               status: similarity === 100 ? 'identical' : 'similar',
//               matchPercentage: similarity
//             });

//             rightResult.push({
//               content: rightLine,
//               indentation: getIndentation(rightLine),
//               lineNumber: rightIdx + 1,
//               status: similarity === 100 ? 'identical' : 'similar',
//               matchPercentage: similarity
//             });

//             processedLeft.add(leftIdx);
//             processedRight.add(rightIdx);
            
//             if (similarity < 100) {
//               matchDetails.push(`Line ${leftIdx + 1}: ${similarity}% match`);
//             }

//             leftIdx++;
//             rightIdx++;
//             continue;
//           }
//         }

//         if (leftLine) {
//           const bestRightMatch = findBestMatch(leftLine, rightLines, rightIdx);
//           if (bestRightMatch && !processedRight.has(bestRightMatch.index)) {
//             while (rightIdx < bestRightMatch.index) {
//               const indent = getIndentation(leftLine);
//               rightResult.push({
//                 content: indent + '// Missing line',
//                 indentation: indent,
//                 lineNumber: rightIdx + 1,
//                 status: 'placeholder',
//                 matchPercentage: 0
//               });
//               matchDetails.push(`Line ${rightIdx + 1}: Missing in right side`);
//               rightIdx++;
//             }
//             continue;
//           }
//         }

//         if (rightLine) {
//           const bestLeftMatch = findBestMatch(rightLine, leftLines, leftIdx);
//           if (bestLeftMatch && !processedLeft.has(bestLeftMatch.index)) {
//             while (leftIdx < bestLeftMatch.index) {
//               const indent = getIndentation(rightLine);
//               leftResult.push({
//                 content: indent + '// Missing line',
//                 indentation: indent,
//                 lineNumber: leftIdx + 1,
//                 status: 'placeholder',
//                 matchPercentage: 0
//               });
//               matchDetails.push(`Line ${leftIdx + 1}: Missing in left side`);
//               leftIdx++;
//             }
//             continue;
//           }
//         }

//         if (leftLine) {
//           leftResult.push({
//             content: leftLine,
//             indentation: getIndentation(leftLine),
//             lineNumber: leftIdx + 1,
//             status: 'different',
//             matchPercentage: 0
//           });
//           processedLeft.add(leftIdx);
//           leftIdx++;
//         }

//         if (rightLine) {
//           rightResult.push({
//             content: rightLine,
//             indentation: getIndentation(rightLine),
//             lineNumber: rightIdx + 1,
//             status: 'different',
//             matchPercentage: 0
//           });
//           processedRight.add(rightIdx);
//           rightIdx++;
//         }
//       }

//       while (leftIdx < leftLines.length) {
//         const leftLine = leftLines[leftIdx];
//         leftResult.push({
//           content: leftLine,
//           indentation: getIndentation(leftLine),
//           lineNumber: leftIdx + 1,
//           status: 'different',
//           matchPercentage: 0
//         });
        
//         rightResult.push({
//           content: getIndentation(leftLine) + '// Missing line',
//           indentation: getIndentation(leftLine),
//           lineNumber: rightIdx + 1,
//           status: 'placeholder',
//           matchPercentage: 0
//         });
        
//         matchDetails.push(`Line ${rightIdx + 1}: Missing in right side`);
//         leftIdx++;
//         rightIdx++;
//       }

//       while (rightIdx < rightLines.length) {
//         const rightLine = rightLines[rightIdx];
//         rightResult.push({
//           content: rightLine,
//           indentation: getIndentation(rightLine),
//           lineNumber: rightIdx + 1,
//           status: 'different',
//           matchPercentage: 0
//         });
        
//         leftResult.push({
//           content: getIndentation(rightLine) + '// Missing line',
//           indentation: getIndentation(rightLine),
//           lineNumber: leftIdx + 1,
//           status: 'placeholder',
//           matchPercentage: 0
//         });
        
//         matchDetails.push(`Line ${leftIdx + 1}: Missing in left side`);
//         leftIdx++;
//         rightIdx++;
//       }

//       setComparison({
//         left: leftResult,
//         right: rightResult,
//         matchDetails
//       });
//       setShowResults(true);
//     } catch (error) {
//       toast({
//         title: "Invalid JSON",
//         description: "Please ensure both inputs contain valid JSON",
//         variant: "destructive",
//       });
//     }
//   };

//   const handlePaste = async (side: "left" | "right") => {
//     try {
//       const text = await navigator.clipboard.readText();
//       if (side === "left") {
//         setLeftJson(text);
//       } else {
//         setRightJson(text);
//       }
//       toast({
//         title: "Content pasted",
//         description: `Pasted into ${side} side`
//       });
//     } catch (err) {
//       toast({
//         title: "Failed to paste",
//         description: "Please paste manually",
//         variant: "destructive",
//       });
//     }
//   };

//   const getLineStyle = (line: DiffLine): string => {
//     return cn(
//       "px-4 py-1 font-mono text-sm whitespace-pre",
//       line.status === 'identical' && "",
//       line.status === 'similar' && "bg-yellow-500/20",
//       line.status === 'different' && "bg-red-500/20",
//       line.status === 'placeholder' && "bg-gray-500/10 text-gray-500 italic",
//       line.status === 'missing' && "bg-gray-500/20"
//     );
//   };

//   const renderLine = (line: DiffLine) => (
//     <div className={getLineStyle(line)}>
//       <span className="text-gray-500 mr-4 select-none inline-block w-8 text-right">
//         {line.lineNumber}
//       </span>
//       <span>
//         {line.content || "\u00A0"}
//       </span>
//       {line.status !== 'placeholder' && line.matchPercentage > 0 && line.matchPercentage < 100 && (
//         <span className="text-xs text-gray-500 ml-2">
//           {line.matchPercentage}%
//         </span>
//       )}
//     </div>
//   );

//   return (
//     <div className="w-full min-h-screen bg-background p-4">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {!showResults ? (
//           <div className="space-y-6">
//             <div className="text-center">
//               <h1 className="text-2xl font-bold mb-2">JSON Compare</h1>
//               <p className="text-muted-foreground">Compare two JSON documents</p>
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               {/* Left Input */}
//               <Card className="p-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <div className="flex items-center gap-2">
//                     <FileJson className="h-5 w-5" />
//                     <span className="font-semibold">Left JSON</span>
//                   </div>
//                   <Button variant="ghost" size="sm" onClick={() => handlePaste("left")}>
//                     <Clipboard className="h-4 w-4 mr-2" />
//                     Paste
//                   </Button>
//                 </div>
//                 <textarea
//                   value={leftJson}
//                   onChange={(e) => setLeftJson(e.target.value)}
//                   className="w-full h-[400px] p-2 font-mono text-sm border rounded-md resize-none focus:outline-none focus:ring-2"
//                   placeholder="Paste your JSON here..."
//                 />
//               </Card>

//               {/* Right Input */}
//               <Card className="p-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <div className="flex items-center gap-2">
//                     <FileJson className="h-5 w-5" />
//                     <span className="font-semibold">Right JSON</span>
//                   </div>
//                   <Button variant="ghost" size="sm" onClick={() => handlePaste("right")}>
//                     <Clipboard className="h-4 w-4 mr-2" />
//                     Paste
//                   </Button>
//                 </div>
//                 <textarea
//                   value={rightJson}
//                   onChange={(e) => setRightJson(e.target.value)}
//                   className="w-full h-[400px] p-2 font-mono text-sm border rounded-md resize-none focus:outline-none focus:ring-2"
//                   placeholder="Paste your JSON here..."
//                 />
//               </Card>
//             </div>

//             <div className="flex justify-center">
//               <Button onClick={compareJson} className="gap-2">
//                 <ArrowLeftRight className="h-4 w-4" />
//                 Compare JSON
//               </Button>
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             <div className="flex items-center justify-between">
//               <Button onClick={() => setShowResults(false)} variant="ghost" className="gap-2">
//                 <ArrowLeft className="h-4 w-4" />
//                 Back to Input
//               </Button>
//               <h2 className="text-xl font-semibold">Comparison Results</h2>
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               {/* Left Result */}
//               <Card className="p-4">
//                 <ScrollArea className="h-[60vh]">
//                   <div>
//                     {comparison?.left.map((line, i) => (
//                       <div key={i}>{renderLine(line)}</div>
//                     ))}
//                   </div>
//                 </ScrollArea>
//               </Card>

//               {/* Right Result */}
//               <Card className="p-4">
//                 <ScrollArea className="h-[60vh]">
//                   <div>
//                     {comparison?.right.map((line, i) => (
//                       <div key={i}>{renderLine(line)}</div>
//                     ))}
//                   </div>
//                 </ScrollArea>
//               </Card>
//             </div>

//             {/* Match Details */}
//             <Card className="p-4">
//               <h3 className="font-semibold mb-2">Match Details</h3>
//               <ScrollArea className="h-40">
//                 {comparison?.matchDetails.map((detail, i) => (
//                   <div key={i} className="py-1">{detail}</div>
//                 ))}
//               </ScrollArea>
//             </Card>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default JsonCompare;