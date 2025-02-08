import { useState } from "react"
import {
  Box,
  Container,
  VStack,
  HStack,
  Input,
  Button,
  Heading,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  Avatar,
  IconButton,
  Card,
  CardBody,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react"
import { update_user, logout } from "../api/endpoints"
import { Camera, User, Mail, UserCircle, FileText, LogOut, Save } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Settings = () => {
  const storage = JSON.parse(localStorage.getItem("userData") || "{}")

  const [username, setUsername] = useState(storage.username || "")
  const [email, setEmail] = useState(storage.email || "")
  const [firstName, setFirstName] = useState(storage.first_name || "")
  const [lastName, setLastName] = useState(storage.last_name || "")
  const [bio, setBio] = useState(storage.bio || "")
  const [profileImage, setProfileImage] = useState(storage.profile_image || "")
  const [imageFile, setImageFile] = useState(null)  // Store the image file
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const toast = useToast()

  const bgColor = useColorModeValue("white", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch {
      toast({
        title: "Error logging out",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleUpdate = async () => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("username", username)
      formData.append("email", email)
      formData.append("first_name", firstName)
      formData.append("last_name", lastName)
      formData.append("bio", bio)

      // Append the profile image if it's selected
      if (imageFile) {
        formData.append("profile_image", imageFile)
      }

      await update_user(formData) // Assuming update_user can handle FormData
      // Update localStorage with the new user data, including the image URL and username
      const updatedUserData = {
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        bio,
        profile_image: profileImage,  // Save the updated image URL
      }
      localStorage.setItem("userData", JSON.stringify(updatedUserData))
      toast({
        title: "Profile updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch {
      toast({
        title: "Error updating profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="container.md" py={10}>
      <Card bg={bgColor} shadow="xl" rounded="lg">
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Flex justifyContent="space-between" alignItems="center">
              <Heading size="lg" color={textColor}>
                Settings
              </Heading>
              <IconButton
                aria-label="Logout"
                icon={<LogOut />}
                onClick={handleLogout}
                colorScheme="red"
                variant="ghost"
              />
            </Flex>

            <Flex justifyContent="center" mb={4} position="relative">
              <Avatar size="2xl" src={profileImage} name={`${firstName} ${lastName}`} />
              <IconButton
                aria-label="Change profile picture"
                icon={<Camera />}
                size="sm"
                colorScheme="blue"
                rounded="full"
                position="absolute"
                bottom={0}
                right={0}
                onClick={() => document.getElementById("profile-image-input")?.click()}
              />
              <Input
                id="profile-image-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const imageUrl = URL.createObjectURL(file)
                    setProfileImage(imageUrl) // Display the image immediately
                    setImageFile(file) // Store the actual file for uploading
                  }
                }}
                display="none"
              />
            </Flex>

            <FormControl>
              <FormLabel>
                <HStack spacing={2}>
                  <User size={18} />
                  <Box>Username</Box>
                </HStack>
              </FormLabel>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel>
                <HStack spacing={2}>
                  <Mail size={18} />
                  <Box>Email</Box>
                </HStack>
              </FormLabel>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </FormControl>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <UserCircle size={18} />
                    <Box>First Name</Box>
                  </HStack>
                </FormLabel>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <UserCircle size={18} />
                    <Box>Last Name</Box>
                  </HStack>
                </FormLabel>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>
                <HStack spacing={2}>
                  <FileText size={18} />
                  <Box>Bio</Box>
                </HStack>
              </FormLabel>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
            </FormControl>

            <Button
              leftIcon={<Save />}
              colorScheme="blue"
              onClick={handleUpdate}
              isLoading={isLoading}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  )
}

export default Settings
