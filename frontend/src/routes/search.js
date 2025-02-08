import { 
    VStack, Flex, HStack, Input, Button, Box, 
    Avatar, Heading, Text, SimpleGrid, Skeleton,
    useColorModeValue, IconButton, Tag, useToast
  } from "@chakra-ui/react";
  import { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { search_users } from "../api/endpoints";
  import { motion } from "framer-motion";
  import { FiSearch, FiUserPlus } from "react-icons/fi";
  
  const MotionBox = motion(Box);
  
  const Search = () => {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const bgColor = useColorModeValue('white', 'gray.800');
    const inputBg = useColorModeValue('gray.50', 'gray.700');
  
    const handleSearch = async () => {
      if (!search.trim()) return;
      
      setIsLoading(true);
      try {
        const users = await search_users(search);
        setUsers(users);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to search users",
          status: "error"
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <Flex 
        w="100%" 
        minH="100vh" 
        justify="center"
        bg={useColorModeValue('gray.50', 'gray.900')}
        p={4}
      >
        <VStack 
          w="100%" 
          maxW="800px" 
          spacing={6}
          pt={{ base: '10vh', md: '15vh' }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            w="100%"
          >
            <Heading 
              size="xl" 
              bgGradient="linear(to-r, blue.400, purple.600)"
              bgClip="text"
              textAlign="center"
              mb={8}
            >
              Discover Amazing People
            </Heading>
            
            <HStack 
              w="100%"
              as={MotionBox}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring" }}
            >
              <Input
                placeholder="Search by username or name..."
                size="lg"
                borderRadius="full"
                bg={inputBg}
                _focus={{ boxShadow: 'outline' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                fontSize="md"
                px={6}
              />
              <IconButton
                colorScheme="blue"
                aria-label="Search users"
                icon={<FiSearch />}
                size="lg"
                borderRadius="full"
                onClick={handleSearch}
                isLoading={isLoading}
              />
            </HStack>
          </MotionBox>
  
          <SimpleGrid 
            columns={{ base: 1, md: 2 }} 
            spacing={4} 
            w="100%"
            py={4}
          >
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} h="120px" borderRadius="2xl" />
              ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <UserProfile 
                  key={user.username}
                  {...user}
                />
              ))
            ) : (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                gridColumn="1 / -1"
                textAlign="center"
                p={8}
              >
                <Text fontSize="xl" color="gray.500">
                  {search ? "No users found" : "Start typing to search users"}
                </Text>
              </MotionBox>
            )}
          </SimpleGrid>
        </VStack>
      </Flex>
    );
  };
  
  const UserProfile = ({ username, profile_image, first_name, last_name }) => {
    const nav = useNavigate();
    const bgColor = useColorModeValue('white', 'gray.700');
  
    return (
      <MotionBox
        w="100%"
        p={4}
        borderRadius="2xl"
        bg={bgColor}
        boxShadow="md"
        cursor="pointer"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        onClick={() => nav(`/${username}`)}
      >
        <Flex align="center" justify="space-between">
          <HStack spacing={4}>
            <Avatar
              size="lg"
              name={`${first_name} ${last_name}`}
              src={profile_image}
              border="2px solid"
              borderColor="blue.200"
            />
            <VStack align="start" spacing={1}>
              <Heading fontSize="lg">
                {first_name} {last_name}
              </Heading>
              <Text color="gray.500" fontSize="sm">@{username}</Text>
            </VStack>
          </HStack>
          
          <Button 
            leftIcon={<FiUserPlus />} 
            colorScheme="blue" 
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Add follow logic here
            }}
          >
            Follow
          </Button>
        </Flex>
      </MotionBox>
    );
  };
  
export default Search;