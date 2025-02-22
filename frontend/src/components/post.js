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
  useDisclosure
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { toggleLike, delete_post, create_comment, get_comments } from "../api/endpoints";
import { motion, AnimatePresence } from "framer-motion";
import { SERVER_URL } from "../constants/constants";
import { get_user_profile_data } from "../api/endpoints";
import { 
  FaHeart, 
  FaRegHeart, 
  FaTrash,
  FaRegComment // New: Comment icon
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

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const storage = JSON.parse(localStorage.getItem("userData") || "{}");
  const [currentUser, setCurrentUser] = useState(storage.username || "");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal control

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
        console.log('Comments response:', response);
        setComments(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error fetching comments:', error.response || error);
        toast({ title: "Error fetching comments", status: "error", duration: 3000, isClosable: true });
        setComments([]);
      }
    };
    if (isOpen) fetchComments(); // Fetch only when modal opens
  }, [id, toast, isOpen]);

  const handleToggleLike = async () => {
    try {
      const data = await toggleLike(id);
      if (data.now_liked) {
        setClientLiked(true);
        setClientLikeCount(prev => prev + 1);
      } else {
        setClientLiked(false);
        setClientLikeCount(prev => prev - 1);
      }
    } catch (error) {
      toast({ title: "Error toggling like", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleDeletePost = async () => {
    try {
      await delete_post(id);
      setIsDeleted(true);
    } catch {
      toast({ title: "Error in delete post", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    const formData = new FormData();
    formData.append('post_id', id);
    formData.append('comment', newComment);
    try {
      const response = await create_comment(formData);
      setComments(prev => [...prev, response]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({ title: "Error posting comment", status: "error", duration: 3000, isClosable: true });
    } finally {
      setCommentLoading(false);
    }
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
              onClick={onOpen} // Open modal
              whileTap={{ scale: 0.9 }}
              _hover={{ color: 'blue.400' }}
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

      {/* Modal for Comments */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Comments</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="start" spacing={4} maxH="400px" overflowY="auto">
              <AnimatePresence>
                {(comments || []).map((comment) => (
                  <MotionBox
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    w="100%"
                  >
                    <HStack spacing={2}>
                      <Avatar name={comment.username} size="sm" />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">@{comment.username}</Text>
                        <Text>{comment.comment}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {comment.formatted_date} • {comment.comment_like_count} likes
                        </Text>
                      </VStack>
                    </HStack>
                  </MotionBox>
                ))}
              </AnimatePresence>
            </VStack>
            <HStack mt={4} pb={4}>
              <Input
                placeholder="Add a comment..."
                size="sm"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={commentLoading}
              />
              <Button
                size="sm"
                colorScheme="blue"
                onClick={handlePostComment}
                isLoading={commentLoading}
              >
                Post
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </MotionBox>
  );
};

export default Post;