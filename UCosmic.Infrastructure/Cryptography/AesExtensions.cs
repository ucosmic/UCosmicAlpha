using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace UCosmic.Cryptography
{
    public static class AesExtensions
    {
        /// <summary>
        /// Encrypt the given string using AES. The string can be decrypted using
        /// DecryptAes(). The sharedSecret parameters must match.
        /// </summary>
        /// <param name="plainText">The text to encrypt.</param>
        /// <param name="sharedSecret">A password used to generate a key for encryption.</param>
        /// <param name="salt">A salt used to generate a key for encryption.</param>
        public static string EncryptAes(this string plainText, string sharedSecret, string salt)
        {
            if (string.IsNullOrEmpty(plainText)) throw new ArgumentNullException("plainText");
            if (string.IsNullOrEmpty(sharedSecret)) throw new ArgumentNullException("sharedSecret");
            if (string.IsNullOrEmpty(salt)) throw new ArgumentNullException("salt");

            using (var algorithm = new RijndaelManaged())
            {
                try
                {
                    var saltBytes = Encoding.ASCII.GetBytes(salt); // convert salt to byte array

                    // generate the key from the shared secret and the salt
                    var key = new Rfc2898DeriveBytes(sharedSecret, saltBytes);
                    algorithm.Key = key.GetBytes(algorithm.KeySize / 8);

                    // Create a decryptor to perform the stream transform.
                    var encryptor = algorithm.CreateEncryptor(algorithm.Key, algorithm.IV);

                    // Create the streams used for encryption.
                    using (var memoryStream = new MemoryStream())
                    {
                        // prepend the IV
                        memoryStream.Write(BitConverter.GetBytes(algorithm.IV.Length), 0, sizeof(int));
                        memoryStream.Write(algorithm.IV, 0, algorithm.IV.Length);
                        using (var cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
                        {
                            using (var streamWriter = new StreamWriter(cryptoStream))
                            {
                                //Write all data to the stream.
                                streamWriter.Write(plainText);
                            }
                        }
                        var encrypted = Convert.ToBase64String(memoryStream.ToArray());
                        return encrypted;
                    }

                }
                finally
                {
                    algorithm.Clear(); // Clear the RijndaelManaged object.
                }
            }
        }

        /// <summary>
        /// Decrypt the given string. Assumes the string was encrypted using
        /// EncryptAes(), using an identical sharedSecret.
        /// </summary>
        /// <param name="cipherText">The text to decrypt.</param>
        /// <param name="sharedSecret">A password used to generate a key for decryption.</param>
        /// <param name="salt">A salt used to generate a key for encryption.</param>
        public static string DecryptAes(this string cipherText, string sharedSecret, string salt)
        {
            if (string.IsNullOrEmpty(cipherText)) throw new ArgumentNullException("cipherText");
            if (string.IsNullOrEmpty(sharedSecret)) throw new ArgumentNullException("sharedSecret");
            if (string.IsNullOrEmpty(salt)) throw new ArgumentNullException("salt");

            using (var aesAlg = new RijndaelManaged())
            {
                try
                {
                    var saltBytes = Encoding.ASCII.GetBytes(salt); // convert salt to byte array

                    // generate the key from the shared secret and the salt
                    var key = new Rfc2898DeriveBytes(sharedSecret, saltBytes);

                    // Create the streams used for decryption.
                    var bytes = Convert.FromBase64String(cipherText);
                    using (var memoryStream = new MemoryStream(bytes))
                    {
                        // Create a RijndaelManaged object with the specified key and IV.
                        aesAlg.Key = key.GetBytes(aesAlg.KeySize / 8);

                        // Get the initialization vector from the encrypted stream
                        aesAlg.IV = ReadByteArray(memoryStream);

                        // Create a decrytor to perform the stream transform.
                        var decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);
                        using (var cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
                        {
                            using (var streamReader = new StreamReader(cryptoStream))
                            {
                                // Read the decrypted bytes from the decrypting stream
                                // and place them in a string.
                                var plainText = streamReader.ReadToEnd();
                                return plainText;
                            }
                        }
                    }
                }
                finally
                {
                    aesAlg.Clear(); // Clear the RijndaelManaged object.
                }
            }
        }

        private static byte[] ReadByteArray(Stream s)
        {
            var rawLength = new byte[sizeof(int)];
            if (s.Read(rawLength, 0, rawLength.Length) != rawLength.Length)
                throw new SystemException("Stream did not contain properly formatted byte array");

            var buffer = new byte[BitConverter.ToInt32(rawLength, 0)];
            if (s.Read(buffer, 0, buffer.Length) != buffer.Length)
                throw new SystemException("Did not read byte array properly");

            return buffer;
        }
    }
}
