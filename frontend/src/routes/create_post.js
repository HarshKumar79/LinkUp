import { 
    VStack, 
    Flex, 
    Heading, 
    FormControl, 
    FormLabel, 
    Input, 
    Button, 
    Textarea,
    Icon,
    Box,
    useColorModeValue,
    Card,
    CardBody,
    CardHeader,
    Avatar,
    Text,
    HStack
  } from "@chakra-ui/react";
  import { create_post } from "../api/endpoints";
  import { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { FiCamera, FiX } from 'react-icons/fi';
  import { motion } from 'framer-motion';
  
  const MotionBox = motion(Box);
  const MotionButton = motion(Button);
  
  const CreatePost = () => {

    const [postImage, setPostImage] = useState(null)
    const [imageFile, setImageFile] = useState(null)  // Store the image file

    const [description, setDescription] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const nav = useNavigate();
    const cardBg = useColorModeValue('white', 'gray.800');
    const gradient = useColorModeValue(
      'linear(to-r, blue.400, purple.500)',
      'linear(to-r, blue.600, purple.700)'
    );
  
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          const imageUrl = URL.createObjectURL(file)
          setPostImage(imageUrl) // Display the image immediately
          setImageFile(file)
          reader.onloadend = () => {
            setImagePreview(reader.result); // Store the preview data URL
          };
          reader.readAsDataURL(file); // Read the file as base64-encoded Data URL
        }
      };
      
  
    const handleRemoveImage = () => {
      setImagePreview(null);
      setImageFile(null);  // Clear the file reference
    };

    const handlePost = async () => {
      if (!description.trim()) return;
      
      setIsLoading(true);
      const formData = new FormData();
      formData.append('description', description);
      
      // Append the actual File object instead of the preview URL
      if (imageFile) {
          formData.append('image', imageFile);
      }
      
      try {
          await create_post(formData);
          nav('/');
      } catch {
          alert('Error creating post');
      } finally {
          setIsLoading(false);
      }
  };
      
      
      
  
    return (
      <Flex 
        minH="100vh" 
        align="center" 
        justify="center" 
        bg={useColorModeValue('gray.50', 'gray.900')}
        p={4}
      >
        <MotionBox
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          w="100%"
          maxW="600px"
        >
          <Card 
            borderRadius="2xl"
            boxShadow="xl"
            bg={cardBg}
          >
            <CardHeader
              bgGradient={gradient}
              borderTopRadius="2xl"
              py={6}
              px={8}
            >
              <Heading 
                color="white" 
                fontSize="2xl"
                textAlign="center"
              >
                Create New Post
              </Heading>
            </CardHeader>
  
            <CardBody p={8}>
              <VStack spacing={6}>
                {/* Image Upload Section */}
                <FormControl>
                  <Box
                    border="2px dashed"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    borderRadius="xl"
                    p={4}
                    textAlign="center"
                    cursor="pointer"
                    position="relative"
                    _hover={{ borderColor: 'blue.400' }}
                  >
                    <input
                      type="file"
                      
                      accept="image/*"
                      id="image-upload"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}

                    />
                    <label htmlFor="image-upload">
                      <VStack spacing={3}>
                        <Icon as={FiCamera} boxSize={8} color="gray.400" />
                        <Text fontSize="sm" color="gray.500">
                          Click to upload photo
                        </Text>
                      </VStack>
                    </label>
                    
                    {imagePreview && (
                      <Box mt={4}>
                        <Box position="relative">
                          <Avatar
                            src={imagePreview}
                            size="2xl"
                            borderRadius="xl"
                            mb={2}
                          />
                          <MotionButton
                            position="absolute"
                            top={-2}
                            right={-2}
                            size="sm"
                            borderRadius="full"
                            colorScheme="red"
                            onClick={handleRemoveImage}
                            whileHover={{ scale: 1.1 }}
                          >
                            <FiX />
                          </MotionButton>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </FormControl>
  
                {/* Caption Input */}
                <FormControl>
                  <VStack align="start" spacing={3}>
                    <FormLabel fontSize="lg" fontWeight="600">
                      Write your caption
                    </FormLabel>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What's on your mind?"
                      size="lg"
                      borderRadius="xl"
                      rows={4}
                      resize="none"
                      _focus={{ boxShadow: 'outline' }}
                    />
                  </VStack>
                </FormControl>
  
                {/* Action Buttons */}
                <HStack w="100%" spacing={4}>
                  <Button
                    w="50%"
                    variant="outline"
                    borderRadius="xl"
                    size="lg"
                    onClick={() => nav(-1)}
                  >
                    Cancel
                  </Button>
                  <MotionButton
                    w="50%"
                    colorScheme="blue"
                    size="lg"
                    borderRadius="xl"
                    onClick={handlePost}
                    isLoading={isLoading}
                    loadingText="Posting..."
                    bgGradient={gradient}
                    _hover={{ transform: 'translateY(-2px)' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Share Post
                  </MotionButton>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>
      </Flex>
    );
  };
  
  export default CreatePost;