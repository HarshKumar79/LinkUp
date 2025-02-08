import { 
  Heading, 
  Flex, 
  Box, 
  useToast,
  useColorModeValue,
  Center,
  IconButton,
  Skeleton,
  Button
} from "@chakra-ui/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { get_posts } from "../api/endpoints";
import Post from "../components/post";
import { motion } from "framer-motion";
import { FiArrowDown } from "react-icons/fi";

const MotionBox = motion(Box);
const MotionIconButton = motion(IconButton);

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const toast = useToast();
  const containerRef = useRef(null);
  const bgColor = useColorModeValue("white", "gray.900");
  const postBgColor = useColorModeValue("gray.50", "gray.800");

  // Fetch posts function
  const fetchData = async () => {
      try {
          const data = await get_posts(nextPage);
          if (data.results.length > 0) {
              setPosts((prevPosts) => [...prevPosts, ...data.results.filter(post => !prevPosts.some(p => p.id === post.id))]);
              setNextPage(data.next ? nextPage + 1 : nextPage);
              setHasMore(data.next !== null);
          } else {
              setHasMore(false);
          }
      } catch (error) {
          toast({
              title: "Error",
              description: "Failed to fetch posts.",
              status: "error",
              duration: 3000,
              isClosable: true,
          });
      } finally {
          setLoading(false);
      }
  };

  // Initial load
  useEffect(() => {
      fetchData();
  }, []);

  // Load more posts
  const loadMorePosts = () => {
      if (hasMore && !loading) {
          fetchData();
      }
  };

  return (
      <Flex
          ref={containerRef}
          direction="column"
          align="center"
          w="full"
          minH="100vh"
          p={4}
          bg={bgColor}
          css={{
              "::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
          }}
      >
          <Heading size="xl" mb={6} fontWeight="bold" color={useColorModeValue("gray.700", "gray.200")}>
              Posts
          </Heading>

          {/* Loading Skeletons */}
          {loading && (
              Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} w={{ base: "100%", md: "600px" }} h="400px" my={4} borderRadius="xl" />
              ))
          )}

          {/* Posts List */}
          {!loading && posts.length > 0 ? (
              posts.map((post) => (
                  <MotionBox
                      key={post.id}
                      w={{ base: "100%", md: "600px" }}
                      my={4}
                      p={6}
                      bg={postBgColor}
                      borderRadius="xl"
                      boxShadow="lg"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                  >
                      <Post
                          id={post.id}
                          username={post.username}
                          description={post.description}
                          formatted_date={post.formatted_date}
                          liked={post.liked}
                          like_count={post.like_count}
                          image_url={post.image_url} // Pass image_url to Post component
                      />
                  </MotionBox>
              ))
          ) : (
              !loading && <Heading color="gray.500">No posts available</Heading>
          )}

          {/* Load More Button */}
          {hasMore && !loading && (
              <Button
                  onClick={loadMorePosts}
                  w="100%"
                  maxW="600px"
                  mt={4}
                  colorScheme="blue"
                  isLoading={loading}
                  loadingText="Loading..."
              >
                  Load More
              </Button>
          )}

          {/* Scroll to Top Button */}
          {posts.length > 5 && (
              <MotionIconButton
                  aria-label="Scroll to top"
                  icon={<FiArrowDown />}
                  colorScheme="blue"
                  size="lg"
                  borderRadius="full"
                  position="fixed"
                  bottom="20px"
                  right="20px"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
              />
          )}
      </Flex>
  );
};

export default Home;