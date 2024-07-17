# install docker and docker-compose (compose v2 now included as plugin with apt install)
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee -a /etc/apt/sources.list.d/docker.list
sudo apt-get update
sudo systemctl stop containerd.service
sudo systemctl stop docker.service
sudo systemctl stop docker.socket
sudo apt-get purge containerd docker.io runc
sudo apt-get autoremove --purge
sudo rm -f /etc/default/docker
sudo apt-get -y --no-install-recommends --reinstall -o Dpkg::Options::="--force-confnew" install \
  containerd.io docker-buildx-plugin docker-ce docker-ce-cli docker-ce-rootless-extras docker-compose-plugin