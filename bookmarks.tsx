import { useListBookmarks, getListBookmarksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { ResourceCard } from "@/components/ResourceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, BookmarkX } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function BookmarksPage() {
  const queryClient = useQueryClient();
  const { data: bookmarks, isLoading } = useListBookmarks();

  const bookmarkedIds = new Set(bookmarks?.map((b) => b.fileId) || []);

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight flex items-center gap-3">
            <Bookmark className="h-8 w-8 text-primary" />
            My Bookmarks
          </h1>
          <p className="text-muted-foreground mt-1">
            {!isLoading && bookmarks ? `${bookmarks.length} saved item${bookmarks.length !== 1 ? "s" : ""}` : "Your saved resources"}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-lg" />
            ))}
          </div>
        ) : bookmarks && bookmarks.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {bookmarks.map((bookmark, i) => (
              <motion.div
                key={bookmark.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ResourceCard
                  file={bookmark.file}
                  isBookmarked={bookmarkedIds.has(bookmark.fileId)}
                  onBookmarkToggle={() => queryClient.invalidateQueries({ queryKey: getListBookmarksQueryKey() })}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <BookmarkX className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No bookmarks yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Start exploring and save resources you want to revisit. They'll appear here.
              </p>
            </div>
            <Button asChild>
              <Link href="/browse">Browse Resources</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
