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
  Input
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { toggleLike, delete_post } from "../api/endpoints";
import { motion, AnimatePresence } from "framer-motion";
import { SERVER_URL } from "../constants/constants";
import { get_user_profile_data } from "../api/endpoints";
import { 
  FaHeart, 
  FaRegHeart, 
  FaTrash
} from "react-icons/fa";
import { BiTime } from "react-icons/bi";

const MotionBox = motion(Box);
const MotionIconButton = motion(IconButton);
const MotionImage = motion(Image);


const Post = ({ id, username, description, formatted_date, liked, like_count, image_url }) => {
  const [loading,setLoading] = useState(true)
  const [profileImage, setProfileImage] = useState('')
  const [image,setImage] = useState('')
  const [clientLiked, setClientLiked] = useState(liked);
  const [clientLikeCount, setClientLikeCount] = useState(like_count);
  const [saved, setSaved] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const storage = JSON.parse(localStorage.getItem("userData") || "{}")

  const [currentUser, setCurrentUser] = useState(storage.username || "")
  const toast = useToast()

  const handleToggleLike = async () => {
    const data = await toggleLike(id);
    if (data.now_liked) {
      setClientLiked(true);
      setClientLikeCount(prev => prev + 1);
    } else {
      setClientLiked(false);
      setClientLikeCount(prev => prev - 1);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await get_user_profile_data(username);
        if (data.profile_image) {
          setProfileImage(data.profile_image.startsWith("http") ? data.profile_image : `${SERVER_URL}${data.profile_image}`);
        } else {
          alert({"error":"Profile image not found for user"});
        }
      } catch{
        alert({'error':"Error fetching user profile data:"});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeletePost = async () => {
    try {
      await delete_post(id);
      setIsDeleted(true);
    } catch{
      toast({
        title: "Error in delete post",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
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
        <Avatar 
          name={username} 
          size="md"
          src={profileImage} // ✅ Yeh ensure karega ki full URL use ho. 
        />
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
          
          {/* <IconButton
            aria-label='Comment'
            icon={<FaComment />}
            variant="ghost"
            _hover={{ color: 'blue.400' }}
          /> */}
          
          {/* <IconButton
            aria-label='Share'
            icon={<FaShare />}
            variant="ghost"
            _hover={{ color: 'green.400' }}
          /> */}
        </HStack>
        <Spacer />
        {/* <IconButton
          aria-label='Save'
          icon={saved ? <FaBookmark /> : <FaRegBookmark />}
          variant="ghost"
          onClick={() => setSaved(!saved)}
          _hover={{ color: 'purple.400' }}
        /> */}
      </Flex>

      {/* Likes and Description */}
      <VStack align="start" px={4} spacing={2}>
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

      {/* Comments Section */}
      {/* <Box p={4} borderTop='1px solid' borderColor={borderColor}>
        <Button variant="ghost" size="sm" colorScheme="blue">
          View all comments (42)
        </Button>
        <HStack mt={2} color="gray.500">
          <Input 
            placeholder="Add a comment..."
            variant="flushed"
            size="sm"
            _placeholder={{ color: 'gray.500' }}
          />
          <Button colorScheme="blue" size="sm" variant="ghost">
            Post
          </Button>
        </HStack>
      </Box> */}
    </MotionBox>
  );
};

export default Post;