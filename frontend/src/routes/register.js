import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Input,
    Flex,
    VStack,
    Button,
    Heading,Text
  } from '@chakra-ui/react'
import { useState } from 'react'
import { login, register } from '../api/endpoints'
import { useNavigate } from 'react-router-dom'

const Register = () => {

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [first_name, setFirst_name] = useState('')
    const [last_name, setLast_name] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const navigate = useNavigate()

    const handleLRegister = async () => {
        if(password === confirmPassword){
            try{
                await register(username,email, first_name, last_name, password)
                alert('Registration succesfull')
                navigate('/login')

            }catch{
                alert('error registering')
            }

        }else{
            alert('password and confirmpassword are not identical')
        }
    }

    const handleNav = () => {
        navigate('/login')
    }

    return(
        <Flex w='100%' height='calc(100vh-80px)' justifyContent='center' alignItems='center'>
        <VStack alignItems='start' w='95%' maxW='400px' gap='20px'>
            <Heading>Register</Heading>
            <FormControl>
                <FormLabel htmlFor='username'>Username</FormLabel>
                <Input onChange={(e) => setUsername(e.target.value)} bg='white' type='text' placeholder='Enter Username' />
            </FormControl>
            <FormControl>
                <FormLabel htmlFor='email'>Email</FormLabel>
                <Input onChange={(e) => setEmail(e.target.value)} bg='white' type='email' placeholder='Enter Username' />
            </FormControl>
            <FormControl>
                <FormLabel htmlFor='first_name'>First Name</FormLabel>
                <Input onChange={(e) => setFirst_name(e.target.value)} bg='white' type='text' placeholder='Enter Username' />
            </FormControl>
            <FormControl>
                <FormLabel htmlFor='last_name'>Last Name</FormLabel>
                <Input onChange={(e) => setLast_name(e.target.value)} bg='white' type='text' placeholder='Enter Username' />
            </FormControl>
            <FormControl>
                <FormLabel htmlFor='password'>Password</FormLabel>
                <Input onChange={(e) => setPassword(e.target.value)} bg='white' type='password' placeholder='Enter Strong Password' />
            </FormControl>
            <FormControl>
                <FormLabel htmlFor='confirmPassword'>Confirm Password</FormLabel>
                <Input onChange={(e) => setConfirmPassword(e.target.value)} bg='white' type='password' placeholder='Enter Strong Password' />
            </FormControl>
            <VStack w='100%'>
                <Button onClick={handleLRegister} w='100%' colorScheme='green' fontSize='18px'>Register</Button>
                <Text onClick={handleNav} fontSize='14px' color='gray.500'>Already have an account? Log in</Text>
            </VStack>
        </VStack>
    </Flex>
    )
}

export default Register