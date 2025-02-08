import { 
    Button, 
    Flex, 
    HStack, 
    Text, 
    Tooltip, 
    useBreakpointValue,
    Box,
    useColorModeValue
  } from "@chakra-ui/react"
  import { useNavigate } from "react-router-dom"
  import { IoPersonOutline, IoSearch} from "react-icons/io5";
  import { IoMdAddCircleOutline } from "react-icons/io";
  import { FaHouse } from "react-icons/fa6";
  import { IoMdSettings } from "react-icons/io";
  import { motion } from "framer-motion";
  
  const MotionBox = motion(Box);
  
  const Navbar = () => {
    const nav = useNavigate()
    const isMobile = useBreakpointValue({ base: true, md: false })
    const bgColor = useColorModeValue('linear-gradient(145deg, #ffffff, #f0f4ff)', 'gray.800')
    const username = JSON.parse(localStorage.getItem('userData'))?.username
  
    const navItems = [
      { icon: <FaHouse />, label: 'Home', action: () => nav('/') },
      { icon: <IoSearch />, label: 'Search', action: () => nav('/search') },
      { icon: <IoMdSettings />, label: 'Settings', action: () => nav('/settings') },
      { icon: <IoPersonOutline />, label: 'Profile', action: () => nav(`/${username}`) },
    ]
  
    return (
      <MotionBox
        as="nav"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        w="100vw"
        h={isMobile ? "60px" : "80px"}
        bg={bgColor}
        boxShadow="lg"
        position="relative"
        top="0"
        zIndex="sticky"
        px={4}
      >
        <Flex 
          h="full" 
          maxW="1200px" 
          mx="auto" 
          justifyContent="space-between" 
          alignItems="center"
        >
          <Text 
            fontSize={isMobile ? "xl" : "2xl"} 
            fontWeight="extrabold" 
            bgGradient="linear(to-r, blue.400, purple.600)"
            bgClip="text"
            cursor="pointer"
            onClick={() => nav('/')}
          >
            LinkUp
          </Text>
  
          <HStack spacing={isMobile ? 2 : 6}>
            {navItems.map((item) => (
              <Tooltip key={item.label} label={item.label} hasArrow>
                <MotionBox
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  cursor="pointer"
                  p={2}
                  borderRadius="md"
                  _hover={{ bg: 'blue.50' }}
                  onClick={item.action}
                >
                  {item.icon}
                </MotionBox>
              </Tooltip>
            ))}
            
            <Button 
              colorScheme="blue" 
              size={isMobile ? 'sm' : 'md'}
              leftIcon={<IoMdAddCircleOutline />}
              onClick={() => nav('/create/post')}
              variant="solid"
              borderRadius="full"
              boxShadow="md"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'xl'
              }}
              transition="all 0.2s"
            >
              {!isMobile && "Create Post"}
            </Button>
  
          </HStack>
        </Flex>
      </MotionBox>
    )
  }
  
  export default Navbar