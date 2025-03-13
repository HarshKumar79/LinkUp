import { 
  VStack, 
  Text, 
  HStack, 
  Flex, 
  Box, 
  Avatar, 
  IconButton, 
  useColorModeValue,
  Tooltip,
  Image, 
  Spacer,
  Button,
  useToast,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { toggleLike, delete_post, create_comment, get_comments, toggleLikeComment } from "../api/endpoints";
import { motion, AnimatePresence } from "framer-motion";
import { SERVER_URL } from "../constants/constants";
import { get_user_profile_data } from "../api/endpoints";
import { 
  FaHeart, 
  FaRegHeart, 
  FaTrash,
  FaRegComment,
  FaShare,
  FaWhatsapp,
  FaTwitter,
  FaLink
} from "react-icons/fa";
import { BiTime } from "react-icons/bi";

const MotionBox = motion(Box);
const MotionIconButton = motion(IconButton);
const MotionImage = motion(Image);

const Post = ({ id, username, description, formatted_date, liked, like_count, image_url }) => {
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState('');
  const [clientLiked, setClientLiked] = useState(liked);
  const [clientLikeCount, setClientLikeCount] = useState(like_count);
  const [isDeleted, setIsDeleted] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyToComment, setReplyToComment] = useState(null);
  const [replyToCommentUsername, setReplyToCommentUsername] = useState("");

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const storage = JSON.parse(localStorage.getItem("userData") || "{}");
  const [currentUser, setCurrentUser] = useState(storage.username || "");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await get_user_profile_data(username);
        if (data.profile_image) {
          setProfileImage(data.profile_image.startsWith("http") ? data.profile_image : `${SERVER_URL}${data.profile_image}`);
        } else {
          toast({ title: "Profile image not found", status: "warning", duration: 3000, isClosable: true });
        }
      } catch {
        toast({ title: "Error fetching user profile", status: "error", duration: 3000, isClosable: true });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username, toast]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await get_comments(id);
        setComments(Array.isArray(response) ? response : []);
      } catch (error) {
        toast({ 
          title: "Error fetching comments", 
          description: error.response?.data?.error || "Network issue", 
          status: "error", 
          duration: 3000, 
          isClosable: true 
        });
        setComments([]);
      }
    };
    if (isOpen) fetchComments();
  }, [id, toast, isOpen]);

  const handleToggleLike = async () => {
    try {
      const data = await toggleLike(id);
      setClientLiked(data.now_liked);
      setClientLikeCount(prev => data.now_liked ? prev + 1 : prev - 1);
    } catch (error) {
      toast({ title: "Error toggling like", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleDeletePost = async () => {
    try {
      await delete_post(id);
      setIsDeleted(true);
    } catch {
      toast({ title: "Error deleting post", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    const formData = new FormData();
    formData.append('post_id', id);
    formData.append('comment', newComment);
    if (replyToComment) {
      formData.append('parent_id', replyToComment);
    }
    try {
      const response = await create_comment(formData);
      setComments(prev => {
        if (replyToComment) {
          return prev.map(comment => 
            comment.id === replyToComment 
              ? { ...comment, replies: [...(comment.replies || []), response] } 
              : comment
          );
        }
        return [...prev, response];
      });
      setNewComment('');
      setReplyToComment(null);
      setReplyToCommentUsername("");
    } catch (error) {
      toast({ title: "Error posting comment", status: "error", duration: 3000, isClosable: true });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await toggleLikeComment(commentId);
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, liked: response.liked, comment_like_count: response.comment_like_count };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId
                  ? { ...reply, liked: response.liked, comment_like_count: response.comment_like_count }
                  : reply
              )
            };
          }
          return comment;
        })
      );
    } catch (error) {
      toast({ title: "Error liking comment", status: "error", duration: 3000, isClosable: true });
    }
  };

  const set_ReplyToComment = (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setReplyToComment(commentId);
      setReplyToCommentUsername(comment.username);
    }
  };

  const postUrl = `${SERVER_URL}/posts/${id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    toast({ title: "Link copied to clipboard!", status: "success", duration: 3000, isClosable: true });
    onShareClose();
  };

  const shareToWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${description} - ${postUrl}`)}`, '_blank');
    onShareClose();
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(description)}&url=${encodeURIComponent(postUrl)}`, '_blank');
    onShareClose();
  };

  if (isDeleted) return null;

  return (
    <MotionBox
      w={['100%', '500px']}
      border='1px solid'
      borderColor={borderColor}
      borderRadius='2xl'
      overflow='hidden'
      bg={bgColor}
      boxShadow='xl'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      layout
    >
      {/* Header */}
      <Flex p={4} align="center" borderBottom="1px solid" borderColor={borderColor}>
        <HStack spacing={3}>
          <Avatar name={username} size="md" src={profileImage} />
          <Text fontWeight="bold">@{username}</Text>
        </HStack>
        <Spacer />
        {currentUser === username && (
          <Tooltip label="Delete Post" hasArrow>
            <IconButton 
              icon={<FaTrash color="red" />} 
              size="sm" 
              variant="ghost" 
              onClick={handleDeletePost} 
            />
          </Tooltip>
        )}
      </Flex>

      {/* Image Content */}
      {image_url && (
        <MotionBox 
          position="relative" 
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <MotionImage
            src={image_url}
            alt="Post content"
            w="100%"
            h="500px"
            objectFit="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        </MotionBox>
      )}

      {/* Action Buttons */}
      <Flex p={4} gap={3}>
        <HStack spacing={3}>
          <Tooltip label={clientLiked ? 'Unlike' : 'Like'} hasArrow>
            <MotionIconButton
              aria-label='Like'
              icon={clientLiked ? <FaHeart color="red" /> : <FaRegHeart />}
              variant="ghost"
              onClick={handleToggleLike}
              whileTap={{ scale: 0.9 }}
              _hover={{ color: 'red.400' }}
            />
          </Tooltip>
          <Tooltip label="Comments" hasArrow>
            <MotionIconButton
              aria-label='Comments'
              icon={<FaRegComment />}
              variant="ghost"
              onClick={onOpen}
              whileTap={{ scale: 0.9 }}
              _hover={{ color: 'blue.400' }}
            />
          </Tooltip>
          <Tooltip label="Share" hasArrow>
            <MotionIconButton
              aria-label='Share'
              icon={<FaShare />}
              variant="ghost"
              onClick={onShareOpen}
              whileTap={{ scale: 0.9 }}
              _hover={{ color: 'green.400' }}
            />
          </Tooltip>
        </HStack>
        <Spacer />
      </Flex>

      {/* Likes and Description */}
      <VStack align="start" px={4} spacing={2} pb={4}>
        <Text fontWeight="bold" fontSize="lg">
          {clientLikeCount.toLocaleString()} likes
        </Text>
        <HStack>
          <Text fontWeight="bold">@{username}</Text>
          <Text>{description}</Text>
        </HStack>
        <HStack color="gray.500" spacing={1}>
          <BiTime />
          <Text mb='5px' fontSize="sm">{formatted_date}</Text>
        </HStack>
      </VStack>

      {/* Comments Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent 
          bg={bgColor}
          borderRadius="xl"
          maxH="80vh"
        >
          <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
            Comments • {comments.length}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0} position="relative">
            <Box 
              overflowY="auto" 
              maxH="60vh"
              p={4}
              pb={20}
            >
              <AnimatePresence>
                {comments.map((comment) => (
                  <MotionBox
                    key={comment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    mb={4}
                    pl={comment.parent ? 8 : 0}  // Use parent instead of parent_id
                    position="relative"
                  >
                    <HStack align="start" spacing={3}>
                      <Avatar 
                        name={comment.username} 
                        size="sm" 
                        src={comment.profile_image} 
                      />
                      <Box flex={1}>
                        <HStack spacing={2} align="baseline">
                          <Text fontWeight="600" fontSize="sm">
                            @{comment.username}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {comment.formatted_date}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" mt={1}>
                          {comment.comment}
                        </Text>
                        <HStack mt={1} spacing={4}>
                          <Button 
                            variant="ghost" 
                            size="xs" 
                            leftIcon={comment.liked ? <FaHeart color="red" /> : <FaRegHeart />}
                            colorScheme="gray"
                            onClick={() => handleLikeComment(comment.id)}
                          >
                            {comment.comment_like_count}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="xs" 
                            leftIcon={<FaRegComment />}
                            colorScheme="gray"
                            onClick={() => set_ReplyToComment(comment.id)}
                          >
                            Reply
                          </Button>
                        </HStack>
                        
                        {/* Replies Section */}
                        {comment.replies?.length > 0 && (
                          <Box mt={2} ml={6} borderLeft="2px solid" borderColor={borderColor} pl={3}>
                            {comment.replies.map(reply => (
                              <Box key={reply.id} mb={3}>
                                <HStack align="start" spacing={2}>
                                  <Avatar 
                                    name={reply.username} 
                                    size="xs" 
                                    src={reply.profile_image} 
                                  />
                                  <Box>
                                    <HStack spacing={2} align="baseline">
                                      <Text fontWeight="600" fontSize="xs">
                                        @{reply.username}
                                      </Text>
                                      <Text fontSize="xs" color="gray.500">
                                        {reply.formatted_date}
                                      </Text>
                                    </HStack>
                                    <Text fontSize="xs" mt={1}>
                                      {reply.comment}
                                    </Text>
                                    <HStack mt={1} spacing={4}>
                                      <Button 
                                        variant="ghost" 
                                        size="xs" 
                                        leftIcon={reply.liked ? <FaHeart color="red" /> : <FaRegHeart />}
                                        colorScheme="gray"
                                        onClick={() => handleLikeComment(reply.id)}
                                      >
                                        {reply.comment_like_count}
                                      </Button>
                                    </HStack>
                                  </Box>
                                </HStack>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </HStack>
                  </MotionBox>
                ))}
              </AnimatePresence>
            </Box>

            {/* Sticky Comment Input */}
            <Box 
              position="sticky" 
              bottom={0} 
              bg={bgColor}
              borderTop="1px solid" 
              borderColor={borderColor}
              p={4}
            >
              <HStack spacing={3}>
                <Avatar 
                  size="sm" 
                  src={profileImage} 
                  name={currentUser}
                />
                <Input 
                  placeholder={replyToComment ? `Replying to @${replyToCommentUsername}` : "Add a comment..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  size="sm"
                  borderRadius="full"
                  borderColor={borderColor}
                  _focus={{ borderColor: 'blue.400' }}
                />
                {replyToComment && (
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    onClick={() => { setReplyToComment(null); setReplyToCommentUsername(""); }}
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  size="sm" 
                  colorScheme="blue" 
                  borderRadius="full"
                  px={6}
                  onClick={handlePostComment}
                  isLoading={commentLoading}
                  isDisabled={!newComment.trim()}
                >
                  {replyToComment ? "Reply" : "Post"}
                </Button>
              </HStack>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Share Modal */}
      <Modal isOpen={isShareOpen} onClose={onShareClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Button leftIcon={<FaWhatsapp />} colorScheme="green" onClick={shareToWhatsApp} w="full">
                Share to WhatsApp
              </Button>
              <Button leftIcon={<FaTwitter />} colorScheme="twitter" onClick={shareToTwitter} w="full">
                Share to Twitter
              </Button>
              <Button leftIcon={<FaLink />} colorScheme="gray" onClick={handleCopyLink} w="full">
                Copy Link
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onShareClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </MotionBox>
  );
};

export default Post;