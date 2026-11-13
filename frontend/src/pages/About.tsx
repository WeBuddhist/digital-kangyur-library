import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StickyFooterShell } from '@/components/ui/molecules/Footer';
import { Users, Sparkles, Mail, Heart, BookOpen, Globe, Facebook, Youtube, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/atoms/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/atoms/avatar';
import { Button } from '@/components/ui/atoms/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/molecules/collapsible';
import useLanguage from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
const About = () => {
  const location = useLocation();
  const {
    isTibetan, t
  } = useLanguage();
  const teamRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);

  // State to track which team member bios are expanded
  const [expandedBios, setExpandedBios] = useState<Record<string, boolean>>({
    tpg: false,
    jt: false,
    tl: false,
    tg: false,
    tn: false
  });

  // Toggle bio expansion
  const toggleBio = (id: string) => {
    setExpandedBios(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.substring(1);
      const element = document.getElementById(sectionId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [location]);
  return (
    <StickyFooterShell className={cn(isTibetan ? 'tibetan' : 'english')}>
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-kangyur-maroon mb-4">
              {t('projectTitle')}
            </h1>
            <p className="text-xl text-kangyur-dark/80 max-w-3xl mx-auto">
              {t('projectSubtitle')}
            </p>
          </div>
          
          {/* Quick navigation */}
          <div className="flex justify-center mb-16">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 bg-white rounded-lg shadow-sm p-2 border border-kangyur-orange/10">
              <a href="#mission" className="px-4 py-2 rounded-md hover:bg-kangyur-orange/10 text-kangyur-dark transition-colors">
                {t('vision')}
              </a>
              <a href="#project" className="px-4 py-2 rounded-md hover:bg-kangyur-orange/10 text-kangyur-dark transition-colors">
                {t('project')}
              </a>
              <a href="#team" className="px-4 py-2 rounded-md hover:bg-kangyur-orange/10 text-kangyur-dark transition-colors">
                {t('team')}
              </a>
              <a href="#advisors" className="px-4 py-2 rounded-md hover:bg-kangyur-orange/10 text-kangyur-dark transition-colors">
                {t('advisors')}
              </a>
              <a href="#contact" className="px-4 py-2 rounded-md hover:bg-kangyur-orange/10 text-kangyur-dark transition-colors">
                {t('contact')}
              </a>
            </div>
          </div>
          
          {/* Mission Section */}
          <div id="mission" ref={missionRef} className="py-12 scroll-mt-24">
            <div className="flex items-center mb-8 border-b border-kangyur-orange/10 pb-4">
              <Heart className="text-kangyur-orange mr-3" size={28} />
              <h2 className="text-3xl font-bold text-kangyur-dark">
                {t('vision')}
              </h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-lg text-kangyur-dark/80">
                {t('missionDescription')}
              </p>
            </div>
          </div>
          
          {/* Project Section */}
          <div id="project" ref={projectRef} className="py-12 scroll-mt-24">
            <div className="flex items-center mb-8 border-b border-kangyur-orange/10 pb-4">
              <Sparkles className="text-kangyur-orange mr-3" size={28} />
              <h2 className="text-3xl font-bold text-kangyur-dark">
                {t('project')}
              </h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-lg text-kangyur-dark/80 mb-6">
                {t('projectDescription')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <Card className="border-kangyur-orange/10 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 bg-kangyur-cream p-2 rounded-full">
                        <BookOpen className="text-kangyur-maroon h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-kangyur-dark">
                          {t('digitalCatalog')}
                        </h3>
                        <p className="text-sm text-kangyur-dark/80 mt-2">
                          {t('digitalCatalogDesc')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-kangyur-orange/10 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 bg-kangyur-cream p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-kangyur-maroon h-5 w-5">
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.3-4.3" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-kangyur-dark">
                          {t('searchCapabilities')}
                        </h3>
                        <p className="text-sm text-kangyur-dark/80 mt-2">
                          {t('searchCapabilitiesDesc')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-kangyur-orange/10 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 bg-kangyur-cream p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-kangyur-maroon h-5 w-5">
                          <path d="M8 2v4" />
                          <path d="M16 2v4" />
                          <path d="M3 10h18" />
                          <path d="M10 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0" />
                          <path d="M12 14v4" />
                          <rect width="18" height="18" x="3" y="4" rx="2" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-kangyur-dark">
                          {t('multimediaIntegration')}
                        </h3>
                        <p className="text-sm text-kangyur-dark/80 mt-2">
                          {t('multimediaIntegrationDesc')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-kangyur-orange/10 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 bg-kangyur-cream p-2 rounded-full">
                        <Globe className="text-kangyur-maroon h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-kangyur-dark">
                          {t('multilingualSummaries')}
                        </h3>
                        <p className="text-sm text-kangyur-dark/80 mt-2">
                          {t('multilingualSummariesDesc')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-kangyur-orange/10 hover:shadow-md transition-shadow md:col-span-2">
                  
                </Card>
              </div>
              
              <p className="text-lg text-kangyur-dark/80 mt-8">
                {t('projectYearsWork')}
              </p>
            </div>
          </div>
          
          {/* Team Section */}
          <div id="team" ref={teamRef} className="py-12 scroll-mt-24">
            <div className="flex items-center mb-8 border-b border-kangyur-orange/10 pb-4">
              <Users className="text-kangyur-orange mr-3" size={28} />
              <h2 className="text-3xl font-bold text-kangyur-dark">
                {t('team')}
              </h2>
            </div>
            
            <h3 className="text-xl font-semibold text-kangyur-dark mb-6">
              {t('coreTeamMembers')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="border-kangyur-orange/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-kangyur-orange">
                      <AvatarFallback className="bg-kangyur-maroon text-white">TPG</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-bold text-kangyur-dark">Tsering Palmo Gellek</h4>
                      <p className="text-sm italic text-kangyur-maroon mb-2">Project Director</p>
                      
                      <Collapsible open={expandedBios.tpg} onOpenChange={() => toggleBio('tpg')}>
                        <div className="text-sm text-kangyur-dark/80">
                          <p className="line-clamp-2">
                            Tsering Palmo Gellek, appointed by her father Tarthang Rinpoche to establish and lead the Sarnath International Nyingma Institute, is dedicated to fostering the potential of small, focused groups to create positive change.
                          </p>
                        </div>
                        <CollapsibleContent>
                          <p className="text-sm text-kangyur-dark/80 mt-2">
                            Born in 1973 in Berkeley, California, she completed her bachelor's degree in International Relations at Lewis and Clark College and earned a Masters of Law from the Fletcher School of Law and Diplomacy. Since 2001, she has directed major projects including the restoration of Nepal's historic Swayambhu Stupa and the installation of peace bells across sacred sites in India and Nepal.
                          </p>
                        </CollapsibleContent>
                        <div className="mt-2">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center text-kangyur-maroon hover:text-kangyur-orange hover:bg-kangyur-cream/20">
                              {expandedBios.tpg ? <>
                                  {t('readLess')} 
                                  <ChevronUp className="ml-1 h-4 w-4" />
                                </> : <>
                                  {t('readMore')} 
                                  <ChevronDown className="ml-1 h-4 w-4" />
                                </>}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </Collapsible>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-kangyur-orange/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-kangyur-orange">
                      <AvatarFallback className="bg-kangyur-maroon text-white">JT</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-bold text-kangyur-dark">Khenpo Ju Tenkyong</h4>
                      <p className="text-sm italic text-kangyur-maroon mb-2">Chief Editor</p>
                      
                      <Collapsible open={expandedBios.jt} onOpenChange={() => toggleBio('jt')}>
                        <div className="text-sm text-kangyur-dark/80">
                          <p className="line-clamp-2">
                            With deep expertise in Buddhist canonical texts, Khenpo Ju Tenkyong leads the editorial team, ensuring accuracy and authenticity in the digital representation of the Kangyur collection.
                          </p>
                        </div>
                        <CollapsibleContent>
                          <p className="text-sm text-kangyur-dark/80 mt-2">
                            Khenpo Ju Tenkyong received his advanced degree in Buddhist philosophy from Namdroling Monastery in South India, where he studied for over 15 years. He specializes in the interpretation and organization of Tibetan Buddhist canonical texts and has contributed to numerous scholarly publications on Buddhist philosophy and practice.
                          </p>
                        </CollapsibleContent>
                        <div className="mt-2">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center text-kangyur-maroon hover:text-kangyur-orange hover:bg-kangyur-cream/20">
                              {expandedBios.jt ? <>
                                  {t('readLess')} 
                                  <ChevronUp className="ml-1 h-4 w-4" />
                                </> : <>
                                  {t('readMore')} 
                                  <ChevronDown className="ml-1 h-4 w-4" />
                                </>}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </Collapsible>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-kangyur-orange/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-kangyur-orange">
                      <AvatarFallback className="bg-kangyur-maroon text-white">TL</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-bold text-kangyur-dark">Khenpo Thupten Lobsang</h4>
                      <p className="text-sm italic text-kangyur-maroon mb-2">Editor</p>
                      
                      <Collapsible open={expandedBios.tl} onOpenChange={() => toggleBio('tl')}>
                        <div className="text-sm text-kangyur-dark/80">
                          <p className="line-clamp-2">
                            As a key member of the editorial team, Khenpo Thupten Lobsang contributes his scholarly expertise to the cataloging and annotation of texts within the Kangyur collection.
                          </p>
                        </div>
                        <CollapsibleContent>
                          <p className="text-sm text-kangyur-dark/80 mt-2">
                            Khenpo Thupten Lobsang has extensive experience in textual analysis and preservation. After completing his monastic education, he spent several years working on preservation projects for ancient Buddhist manuscripts. He is particularly skilled in identifying and organizing texts according to traditional Tibetan classification systems.
                          </p>
                        </CollapsibleContent>
                        <div className="mt-2">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center text-kangyur-maroon hover:text-kangyur-orange hover:bg-kangyur-cream/20">
                              {expandedBios.tl ? <>
                                  {t('readLess')} 
                                  <ChevronUp className="ml-1 h-4 w-4" />
                                </> : <>
                                  {t('readMore')} 
                                  <ChevronDown className="ml-1 h-4 w-4" />
                                </>}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </Collapsible>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-kangyur-orange/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-kangyur-orange">
                      <AvatarFallback className="bg-kangyur-maroon text-white">TG</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-bold text-kangyur-dark">Khenpo Thupthen Gyatso</h4>
                      <p className="text-sm italic text-kangyur-maroon mb-2">Editor</p>
                      
                      <Collapsible open={expandedBios.tg} onOpenChange={() => toggleBio('tg')}>
                        <div className="text-sm text-kangyur-dark/80">
                          <p className="line-clamp-2">
                            Bringing specialized knowledge of Buddhist philosophy and textual traditions, Khenpo Thupthen Gyatso ensures the scholarly integrity of the Kangyur digital resources.
                          </p>
                        </div>
                        <CollapsibleContent>
                          <p className="text-sm text-kangyur-dark/80 mt-2">
                            With a profound understanding of Buddhist philosophy and its textual lineages, Khenpo Thupthen Gyatso has devoted his life to the study and preservation of Buddhist wisdom. He completed his advanced studies at Mindrolling Monastery and has been involved in numerous scholarly projects aimed at making traditional Buddhist teachings accessible to modern audiences.
                          </p>
                        </CollapsibleContent>
                        <div className="mt-2">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center text-kangyur-maroon hover:text-kangyur-orange hover:bg-kangyur-cream/20">
                              {expandedBios.tg ? <>
                                  {t('readLess')} 
                                  <ChevronUp className="ml-1 h-4 w-4" />
                                </> : <>
                                  {t('readMore')} 
                                  <ChevronDown className="ml-1 h-4 w-4" />
                                </>}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </Collapsible>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-kangyur-orange/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-kangyur-orange overflow-hidden">
                      <AvatarImage src="/lovable-uploads/c871aeca-c10f-459d-b977-fc3284443d19.png" alt="Khenpo Tsering Nyima" className="object-cover" />
                      <AvatarFallback className="bg-kangyur-maroon text-white">TN</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-bold text-kangyur-dark">Khenpo Tsering Nyima</h4>
                      <p className="text-sm italic text-kangyur-maroon mb-2">Program Manager</p>
                      
                      <Collapsible open={expandedBios.tn} onOpenChange={() => toggleBio('tn')}>
                        <div className="text-sm text-kangyur-dark/80">
                          <p className="line-clamp-2">
                            Khenpo Tsering Nyima comes from Tibet, where he studied at Tarthang Monastery for six years. In 2006, he came to Namdroling Monastery in India.
                          </p>
                        </div>
                        <CollapsibleContent>
                          <p className="text-sm text-kangyur-dark/80 mt-2">
                            He studied there for fourteen years, and in 2017 received the degree of Lopon. After four years of teaching and fulfilling other Dharma responsibilities, he came to SINI. He has been the general manager of the Nyingma Monlam in Bodhgaya since 2019, works with the Kagyur Project, and is the on-site manager for SINI. In April 2023 he was given the title of Khenpo in a ceremony at Namdroling Monastery.
                          </p>
                        </CollapsibleContent>
                        <div className="mt-2">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center text-kangyur-maroon hover:text-kangyur-orange hover:bg-kangyur-cream/20">
                              {expandedBios.tn ? <>
                                  {t('readLess')} 
                                  <ChevronUp className="ml-1 h-4 w-4" />
                                </> : <>
                                  {t('readMore')} 
                                  <ChevronDown className="ml-1 h-4 w-4" />
                                </>}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </Collapsible>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            
            
            {/* Advisors Section */}
            <div id="advisors" className="scroll-mt-24">
              <div className="flex items-center mb-8 border-b border-kangyur-orange/10 pb-4">
                <GraduationCap className="text-kangyur-orange mr-3" size={28} />
                <h3 className="text-xl font-semibold text-kangyur-dark">
                {t('advisors')}
                </h3>
              </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="border-kangyur-orange/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-kangyur-orange">
                      <AvatarFallback className="bg-kangyur-maroon text-white">DR</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-bold text-kangyur-dark">Dr. Robert Chen</h4>
                      <p className="text-sm italic text-kangyur-maroon mb-2">Digital Humanities Advisor</p>
                      <p className="text-sm text-kangyur-dark/80">
                        Specialist in digital preservation and computational approaches to Buddhist texts with over 20 years of experience in academic research.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-kangyur-orange/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-kangyur-orange">
                      <AvatarFallback className="bg-kangyur-maroon text-white">SP</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-bold text-kangyur-dark">Dr. Sarah Peterson</h4>
                      <p className="text-sm italic text-kangyur-maroon mb-2">Translation Studies Advisor</p>
                      <p className="text-sm text-kangyur-dark/80">
                        Leading expert in Tibetan-English translation methodologies and cross-cultural linguistic analysis.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-kangyur-orange/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-kangyur-orange">
                      <AvatarFallback className="bg-kangyur-maroon text-white">TN</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-bold text-kangyur-dark">Tenzin Norbu</h4>
                      <p className="text-sm italic text-kangyur-maroon mb-2">Cultural Heritage Advisor</p>
                      <p className="text-sm text-kangyur-dark/80">
                        Renowned scholar of Tibetan culture and traditions, focusing on the preservation of ancient wisdom traditions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-kangyur-orange/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-kangyur-orange">
                      <AvatarFallback className="bg-kangyur-maroon text-white">MJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-bold text-kangyur-dark">Prof. Michael Johnson</h4>
                      <p className="text-sm italic text-kangyur-maroon mb-2">Technology Integration Advisor</p>
                      <p className="text-sm text-kangyur-dark/80">
                        Expert in educational technology and digital platform development for cultural institutions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-kangyur-orange/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-kangyur-orange">
                      <AvatarFallback className="bg-kangyur-maroon text-white">LW</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-bold text-kangyur-dark">Dr. Linda Wong</h4>
                      <p className="text-sm italic text-kangyur-maroon mb-2">Academic Partnerships Advisor</p>
                      <p className="text-sm text-kangyur-dark/80">
                        Facilitates collaboration between international universities and Buddhist institutions for research initiatives.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          </div>
          
          {/* Contact Section */}
          <div id="contact" ref={contactRef} className="py-12 scroll-mt-24">
            <div className="flex items-center mb-8 border-b border-kangyur-orange/10 pb-4">
              <Mail className="text-kangyur-orange mr-3" size={28} />
              <h2 className="text-3xl font-bold text-kangyur-dark">
                {t('contact')}
              </h2>
            </div>
            
            <div className="bg-kangyur-light rounded-lg p-8 border border-kangyur-orange/10 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-kangyur-dark mb-4">
                    {t('getInTouch')}
                  </h3>
                  <p className="mb-6 text-kangyur-dark/80">
                    {t('inquiriesText')}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-kangyur-maroon h-5 w-5 mr-3 mt-1">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <div>
                        <p className="font-medium text-kangyur-dark">
                          {t('email')}
                        </p>
                        <a href="mailto:info@sinibridge.org" className="text-kangyur-maroon hover:underline">info@sinibridge.org</a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-kangyur-maroon h-5 w-5 mr-3 mt-1">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <div>
                        <p className="font-medium text-kangyur-dark">
                          {t('phone')}
                        </p>
                        <p className="text-kangyur-dark/80">+91 (0542) 258-5011</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-kangyur-maroon h-5 w-5 mr-3 mt-1">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <div>
                        <p className="font-medium text-kangyur-dark">
                          {t('address')}
                        </p>
                        <p className="text-kangyur-dark/80">
                          Sarnath International Nyingma Institute<br />
                          Mūlagandhakuṭī Vihāra<br />
                          Sarnath, Varanasi - 221007<br />
                          Uttar Pradesh, India
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-kangyur-dark mb-4">
                    {t('connectWithUs')}
                  </h3>
                  
                  <div className="mb-6">
                    <p className="font-medium text-kangyur-dark mb-2">
                      {t('visitMainWebsite')}
                    </p>
                    <a href="https://www.sinibridge.org/" target="_blank" rel="noopener noreferrer" className="text-kangyur-maroon hover:underline">
                      www.sinibridge.org
                    </a>
                  </div>
                  
                  <div>
                    <p className="font-medium text-kangyur-dark mb-2">
                      {t('followUs')}
                    </p>
                    <div className="flex space-x-4">
                      <a href="https://www.facebook.com/sinibridge/" target="_blank" rel="noopener noreferrer" className="text-kangyur-maroon hover:text-kangyur-orange transition-colors">
                        <Facebook size={24} />
                      </a>
                      <a href="https://www.youtube.com/@sarnathinternationalnyingm7662" target="_blank" rel="noopener noreferrer" className="text-kangyur-maroon hover:text-kangyur-orange transition-colors">
                        <Youtube size={24} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-10 pt-6 border-t border-kangyur-orange/10">
                <p className="text-kangyur-dark/80 italic">
                  {t('joinUsText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </StickyFooterShell>
  );
};
export default About;