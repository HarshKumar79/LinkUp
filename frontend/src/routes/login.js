import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Input,
    Flex,
    VStack,
    Button,
    Heading,
    Text,
  } from '@chakra-ui/react'
import { useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

const Login = () => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()
    const { auth_login } = useAuth()

    const handleLogin = () => {
        auth_login(username, password)
    }

    const handleNav = () => {
        navigate('/register')
    }


    return(
        <Flex w='100%' height='80vh' justifyContent='center' alignItems='center'>
        <VStack alignItems='start' w='95%' maxW='400px' gap='30px'>
            <Heading>Login</Heading>
            <FormControl>
                <FormLabel htmlFor='username'>Username</FormLabel>
                <Input onChange={(e) => setUsername(e.target.value)} bg='white' type='text' placeholder='Enter Username' />
            </FormControl>
            <FormControl>
                <FormLabel htmlFor='password'>Password</FormLabel>
                <Input onChange={(e) => setPassword(e.target.value)} bg='white' type='password' placeholder='Enter Strong Password' />
            </FormControl>
            <VStack w='100%'>
                <Button onClick={handleLogin} w='100%' colorScheme='green' fontSize='18px'>Login</Button>
                <Text onClick={handleNav} fontSize='14px' color='gray.500'>Don't have an acccount? Sign Up</Text>
            </VStack>
        </VStack>
    </Flex>
    )
}

export default Login