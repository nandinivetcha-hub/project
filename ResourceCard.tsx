import { useState } from "react";
import { File as FileType, useTrackDownload, useAddBookmark, useRemoveBookmark } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Download, Heart, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

interface ResourceCardProps {
  file: FileType;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
}

export function ResourceCard({ file, isBookmarked = false, onBookmarkToggle }: ResourceCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const trackDownload = useTrackDownload();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  const handleDownload = () => {
    trackDownload.mutate({ id: file.id });
    window.open(file.driveLink, "_blank");
  };

  const handleBookmark = () => {
    if (isBookmarked) {
      removeBookmark.mutate({ id: file.id }, {
        onSuccess: () => {
          if (onBookmarkToggle) onBookmarkToggle();
        }
      });
    } else {
      addBookmark.mutate({ data: { fileId: file.id } }, {
        onSuccess: () => {
          if (onBookmarkToggle) onBookmarkToggle();
        }
      });
    }
  };

  const getFileTypeColor = (type: string) => {
    switch(type) {
      case "Notes": return "bg-primary/10 text-primary hover:bg-primary/20";
      case "PYQs": return "bg-accent/10 text-accent hover:bg-accent/20";
      case "Lab Manual": return "bg-secondary/10 text-secondary hover:bg-secondary/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <>
      <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-1 bg-card">
        <CardHeader className="p-4 pb-2 space-y-2">
          <div className="flex justify-between items-start gap-2">
            <Badge variant="outline" className="bg-muted text-xs font-normal">
              {file.subject}
            </Badge>
            <Badge variant="secondary" className={getFileTypeColor(file.fileType)}>
              {file.fileType}
            </Badge>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
                {file.title}
              </h3>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{file.title}</p>
            </TooltipContent>
          </Tooltip>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {file.unit && <span className="flex items-center gap-1">Unit {file.unit}</span>}
            {file.unit && <span className="text-muted-foreground/30">•</span>}
            <span>{file.branch}</span>
            <span className="text-muted-foreground/30">•</span>
            <span>{file.semester}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
            <span>{format(new Date(file.uploadDate), "MMM d, yyyy")}</span>
            <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {file.downloads}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" /> Preview
          </Button>
          <Button variant="default" size="icon" className="h-9 w-9 shrink-0" onClick={handleDownload}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant={isBookmarked ? "secondary" : "outline"} size="icon" className="h-9 w-9 shrink-0" onClick={handleBookmark}>
            <Heart className={`w-4 h-4 ${isBookmarked ? "fill-destructive text-destructive" : ""}`} />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => setShowQR(true)}>
            <QrCode className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl w-[90vw] h-[85vh] p-0 flex flex-col gap-0">
          <DialogHeader className="p-4 border-b flex-shrink-0">
            <DialogTitle className="flex justify-between items-center pr-8">
              <span className="truncate pr-4">{file.title}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleBookmark}>
                  <Heart className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-destructive text-destructive" : ""}`} /> 
                  {isBookmarked ? "Saved" : "Save"}
                </Button>
                <Button size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full bg-muted/30 p-2">
            <iframe 
              src={`${file.driveLink.replace('/view', '/preview')}`} 
              className="w-full h-full rounded border bg-white"
              title={`Preview of ${file.title}`}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Share Resource</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className="bg-white p-4 rounded-xl border">
              <QRCodeSVG value={file.driveLink} size={200} level="H" />
            </div>
            <div className="text-center space-y-2">
              <h4 className="font-semibold">{file.title}</h4>
              <p className="text-sm text-muted-foreground">{file.subject} • {file.fileType}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => {
              navigator.clipboard.writeText(file.driveLink);
            }}>
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
